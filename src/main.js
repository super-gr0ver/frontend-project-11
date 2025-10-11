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
  // feeds: {
  //   title: '',
  //   description: '',
  // },
  feeds: [],
  requestFreq: {
    length: 10,
    interval: 1,
    unit: '',
  },
  uiState: {
    viewedPost: [],
    // viewedPost: { id: true },
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

const isValidInterval = (unit, interval) => {
  switch (unit) {
    case 'second':
      return (interval <= 60) && (60 % interval === 0);
    case 'minute':
      return (interval <= 60) && (60 % interval === 0);
    case 'day':
      return (interval === 1);
    case 'month':
      // console.log(interval);
      return (interval <= 12) && (12 % interval === 0);
    case 'year':
      return interval === 1;
    default:
      return false;
  }
};

const getSchema = (urls, unit, interval) => yup.object().shape({
  currentUrl: yup
    .string()
    .url()
    .trim()
    .notOneOf(urls)
    .required()
    .test('checkInterval', 'Не верный интервал обновления', () => isValidInterval(unit, interval) === true),

});

const validate = (currentUrl, urls, unit, interval) => {
  const schema = getSchema(urls, unit, interval);
  return schema
    .validate(currentUrl, { abortEarly: false })
    .then(() => ({}))
    .catch((e) => _.keyBy(e.inner, 'path'));
};

const watchedObj = onChange(state, () => view(state));

const parseRss = (data) => {
  const parse = new DOMParser();
  const doc = parse.parseFromString(data, 'application/xml');

  const feedTitle = doc.querySelector('title').textContent;
  const feedDesc = doc.querySelector('description').textContent;

  // Проверка, если title нет в состоянии то добавляем. Исправить на проверку уникального ИД
  // Это чтобы каждый раз при проверке новых постов не добавлялись фиды, которые уже есть
  const uniqFeedTitle = !state.feeds.find((feed) => feed.feedTitle === feedTitle);
  // console.log(uniqFeedTitle);
  if (uniqFeedTitle) {
    state.feeds.unshift({ feedTitle, feedDesc });
  }

  doc.querySelectorAll('item').forEach((item) => {
    const title = item.querySelector('title');
    const link = item.querySelector('link');
    const desc = item.querySelector('description');
    // console.log(item);

    const uniqId = Number(_.uniqueId());
    const isUniq = !state.posts.find(({ id }) => id === uniqId);

    if (isUniq) {
      state.posts.push({
        id: uniqId,
        title: title.textContent,
        desc: desc.textContent,
        link: link.textContent,
      });
      state.uiState.viewedPost.push({
        id: uniqId,
        viewed: true,
      });
    }
  });
  watchedObj.processState = 'done';
};

input.addEventListener('input', () => {
  watchedObj.processState = 'filling';
  watchedObj.errors = '';
});

const updateRss = (url) => {
  getRss(url)
    .then((flow) => {
      if (flow.data.contents) {
        parseRss(flow.data.contents);
        watchedObj.errors = '';
        watchedObj.rssStatus = i18nextInstance.t('rssStatus.done');

        // if (!state.urls.includes(url)) {
        //   watchedObj.urls.push(url);
        // }
        // watchedObj.processState = 'processed';
      }
      setTimeout(updateRss, state.requestFreq.interval, url);
    })

    .catch((error) => {
      watchedObj.processState = 'error';
      watchedObj.errors = error.response;
    });
};

const getInterval = (unit, interval) => {
  switch (unit) {
    case 'second':
      return interval * 1000;
    case 'minute':
      return interval * 60000;
    case 'day':
      return interval * 86400000;
    case 'month':
      // Это 24.85 дней - максимум для движка chrome
      return interval * 2147483647;
    case 'year':
      // Это в реальности не год, а 2147483647
      return interval * 31536000000;
    default:
      return 1;
  }
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.requestFreq.interval = 1;

  const formData = new FormData(e.target);
  const currentUrl = formData.get('url').trim();
  state.form.currentUrl = currentUrl;

  const requestFreq = new URL(currentUrl);
  const unit = requestFreq.searchParams.get('unit');

  const stringInterval = requestFreq.searchParams.get('interval');
  const interval = stringInterval
    ? Number(stringInterval.replace(',', '.'))
    : state.requestFreq.interval;

  // const urlParam = new URL(url);
  // const unit = urlParam.searchParams.get('unit');
  // const stringInterval = urlParam.searchParams.get('interval');

  validate({ currentUrl }, state.urls, unit, interval)
    .then((error) => {
      if (Object.keys(error).length !== 0) {
        state.errors = error.currentUrl?.message || 'err';
        watchedObj.processState = 'error';
        return;
      }
      const updateInterval = getInterval(unit, interval);
      // console.log(updateInterval);
      state.requestFreq.interval = updateInterval;
      state.requestFreq.unit = unit;

      updateRss(currentUrl);
      watchedObj.errors = '';
      watchedObj.rssStatus = i18nextInstance.t('rssStatus.done');
      watchedObj.urls.push(currentUrl);
      watchedObj.processState = 'processed';
    });

  // const params = getRequestFreq(url);
  // const { unit } = params;
  // const { interval } = params;
});
