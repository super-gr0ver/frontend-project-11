import onChange from 'on-change';
import * as yup from 'yup';
import * as _ from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import view from './view.js';

import resources from './locales/ru.js';
import './style.css';

const state = {
  lang: 'ru',
  form: {
    currentUrl: '',
  },
  urls: [],
  processState: '',
  errors: '',
  rssStatus: '',
  posts: [],
  feeds: {
    title: '',
    description: '',
  },
  requestFreq: {
    length: '',
    interval: '',
    unit: '',
  },
};

const getRss = (url) => axios
  .get(
    `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
      url,
    )}`,
  );
// .catch(() => {
//   state.errors = 'error';
// })
// .finally(() => setTimeout(getRss, 10000));

const form = document.querySelector('.rss-form');
const input = document.querySelector('.form-control');

const i18nextInstance = i18n.createInstance();
const run = async () => {
  await i18nextInstance.init({
    lng: state.lang,
    resources,
  });
};
run();

yup.setLocale({
  string: {
    url: () => i18nextInstance.t('formErrors.url'),
  },
  mixed: {
    notOneOf: () => i18nextInstance.t('formErrors.exist'),
  },
});

const getSchema = (urls) => yup.object().shape({
  currentUrl: yup.string().url().trim().notOneOf(urls),
});

const validate = (fields, urls) => {
  const schema = getSchema(urls);
  return schema
    .validate(fields, { abortEarly: false })
    .then(() => { })
    .catch((e) => _.keyBy(e.inner, 'path'));
};

const watchedObj = onChange(state, () => view(state));

const parseRss = (data) => {
  const parse = new DOMParser();
  const doc = parse.parseFromString(data, 'application/xml');
  // console.log(doc);

  const feedTitle = doc.querySelector('title');
  const feedDesc = doc.querySelector('description');
  state.feeds.title = feedTitle.textContent;
  state.feeds.description = feedDesc.textContent;

  doc.querySelectorAll('item').forEach((item) => {
    const title = item.querySelector('title');
    const link = item.querySelector('link');
    // console.log(title);

    // Проверка, если title нет в состоянии то добавляем
    const uniqId = !state.posts.find(({ title }) => title === title.textContent);
    // console.log(uniqId);
    if (uniqId) {
      state.posts.push({
        id: Number(uniqueId()),
        title: title.textContent,
        link: link.textContent,
      });
    }
  });
  watchedObj.processState = 'done';
};

input.addEventListener('input', () => {
  watchedObj.processState = 'filling';
  watchedObj.errors = '';
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const url = formData.get('url');
  state.form.currentUrl = url;

  const requestFreq = new URL(url);
  const interval = requestFreq.searchParams.get('interval');
  const unit = requestFreq.searchParams.get('unit');
  const length = requestFreq.searchParams.get('length');
  state.length = length;
  state.interval = interval;
  state.unit = unit;

  // console.log(interval, unit);

  validate(state.form, state.urls)
    .then((errorObj) => {
      if (Object.keys(errorObj).length !== 0) {
        state.errors = errorObj.currentUrl.message;
        watchedObj.processState = 'error';
      }
    })
    .catch(() => {
      watchedObj.errors = '';
      watchedObj.rssStatus = i18nextInstance.t('rssStatus.done');
      watchedObj.urls.push(url);
      watchedObj.processState = 'processed';
    });
  const updateRss = () => {
    getRss(url)
      .then((flow) => flow.data.contents)
      .then((data) => parseRss(data))
      .catch(() => {
        watchedObj.processState = 'error';
        watchedObj.errors = i18nextInstance.t('rssStatus.networkError');
      })
      .finally(() => {
        setTimeout(updateRss, 5000);
      });
  };
  updateRss();
});
