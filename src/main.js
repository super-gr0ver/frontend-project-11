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
  let { interval } = state.requestFreq;
  // Из за этого не работает месяц
  if (stringInterval) {
    interval = Math.floor(Number(stringInterval.replace(',', '.'), 10));
  }

  switch (unit) {
    case 'second':
      if ((interval <= 60) && (60 % interval === 0)) {
        state.requestFreq.interval = interval * 1000;
        return true;
      }
      return false;
    case 'minute':
      if ((interval <= 60) && (60 % interval === 0)) {
        state.requestFreq.interval = interval * 60000;
        return true;
      }
      return false;
    case 'day':
      if (interval === 1) {
        state.requestFreq.interval = interval * 86400000;
        return true;
      }
      return false;
    case 'month':
      // Месяцы работают не верно
      if ((interval <= 12) && (12 % interval === 0)) {
        state.requestFreq.interval = interval * 2678400000;
        return true;
      }
      return false;
    case 'year':
      if (interval === 1) {
        state.requestFreq.interval = interval * 31536000000;
        return true;
      }
      return false;

    default:
      return false;
  }
};

const getSchema = (urls) => yup.object().shape({
  currentUrl: yup
    .string()
    .url()
    .trim()
    .notOneOf(urls)
    .test('checkInterval', 'Не верный интервал обновления', (url) => {
      const isValidInterval = getInterval(url);
      return isValidInterval === true;
    }),
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

  const updateRss = () => {
    getRss(url)
      .then((flow) => flow.data.contents)
      .then((data) => parseRss(data))
      .catch(() => {
        watchedObj.processState = 'error';
        watchedObj.errors = i18nextInstance.t('rssStatus.networkError');
      })
      .finally(() => {
        // console.log(state.requestFreq.interval);
        setTimeout(updateRss, state.requestFreq.interval);
      });
  };

  validate(state.form, state.urls)
    .then((errorObj) => {
      if (Object.keys(errorObj).length !== 0) {
        state.errors = errorObj.currentUrl.message;
        watchedObj.processState = 'error';
      }
    })
    .catch(() => {
      updateRss();
      watchedObj.errors = '';
      watchedObj.rssStatus = i18nextInstance.t('rssStatus.done');
      watchedObj.urls.push(url);
      watchedObj.processState = 'processed';
      // getInterval(unit, interval);
    });
});
