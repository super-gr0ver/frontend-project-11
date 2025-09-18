import onChange from 'on-change';
import * as yup from 'yup';
import * as _ from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
// import uniqueId from 'lodash/uniqueId.js';
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
    length: 10,
    interval: 1,
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

yup.setLocale({
  string: {
    url: () => i18nextInstance.t('formErrors.url'),
  },
  mixed: {
    notOneOf: () => i18nextInstance.t('formErrors.exist'),
  },
});
run();
// const requestFreq = new URL(url);
// const length = requestFreq.searchParams.get('length');

const getInterval = (url) => {
  const requestFreq = new URL(url);
  const unit = requestFreq.searchParams.get('unit');
  const stringInterval = requestFreq.searchParams.get('interval');

  // if (!stringInterval || !unit) return 1;

  // const interval = Number(stringInterval.replace(',', '.'));

  // const interval = !stringInterval ? state.requestFreq.interval : Number(stringInterval.replace(',', '.'));
  const { interval } = state.requestFreq;

  switch (unit) {
    case 'second':
      return interval * 1000;
    case 'minute':
      return interval * 60000;
    case 'day':
      return interval * 86400000;
    case 'month':
      return interval * 2629743000;
    case 'year':
      return interval * 31536000000;
    default:
      return 1;
  }
};

const getSchema = (urls) => yup.object().shape({
  currentUrl: yup
    .string()
    .url()
    .trim()
    .notOneOf(urls)
    .required(),
});

const validate = (fields, urls) => {
  const schema = getSchema(urls);
  // console.log(schema);
  return schema
    .validate(fields, { abortEarly: false })
    .then(() => ({}))
    .catch((e) => _.keyBy(e.inner, 'path'));
};

const watchedObj = onChange(state, () => view(state));

const parseRss = (data) => {
  const parse = new DOMParser();
  const doc = parse.parseFromString(data, 'application/xml');

  const feedTitle = doc.querySelector('title');
  const feedDesc = doc.querySelector('description');
  state.feeds.title = feedTitle.textContent;
  state.feeds.description = feedDesc.textContent;

  doc.querySelectorAll('item').forEach((item) => {
    const title = item.querySelector('title');
    const link = item.querySelector('link');
    // console.log(title);

    // Проверка, если title нет в состоянии то добавляем
    const uniqId = !state.posts.find((post) => post.title === title.textContent);

    // console.log(uniqId);
    if (uniqId) {
      state.posts.push({
        id: Number(_.uniqueId()),
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

// const setIntervalValue = (url) => {

// };

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url').trim();
  state.form.currentUrl = url;

  validate(state.form, state.urls)
    .then((error) => {
      if (Object.keys(error).length > 0) {
        state.errors = error.currentUrl?.message || 'err';
        watchedObj.processState = 'error';
      }
    });

  const updateInterval = getInterval(url);
  state.requestFreq.interval = updateInterval;

  const updateRss = () => {
    getRss(url)
      .then((flow) => {
        if (flow.data.contents) {
          parseRss(flow.data.contents);
          watchedObj.errors = '';
          watchedObj.rssStatus = i18nextInstance.t('rssStatus.done');

          if (!state.urls.includes(url)) {
            watchedObj.urls.push(url);
          }
          watchedObj.processState = 'processed';
        }
      })

      .catch((error) => {
        watchedObj.processState = 'error';
        watchedObj.errors = error.response;
        // console.log(state.processState);
        // watchedObj.errors = i18nextInstance.t('rssStatus.networkError');
      })
      .finally(() => {
        if (state.processState !== 'error') {
          setTimeout(updateRss, state.requestFreq.interval);
        }
      });
  };
  updateRss();
});
