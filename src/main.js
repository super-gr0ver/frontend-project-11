import onChange from 'on-change';
import * as yup from 'yup';
import * as _ from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
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
  posts: {

  },
};

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

const parseRss = (data) => {
  const parse = new DOMParser();
  const doc = parse.parseFromString(data.data.contents, 'application/xml');
  return doc.querySelectorAll('title').forEach((item) => {
    state.posts = item.textContent;
    // console.log(item.textContent);
  });
};
// console.log(state.posts);
const getRss = (url) => {
  axios
    .get(
      `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
        url,
      )}`,
    )
    .then((data) => {
      parseRss(data);
    })
    .catch(() => {
      // console.log('ooops');
    });
};

const watchedObj = onChange(state, () => view(state));

input.addEventListener('input', () => {
  watchedObj.processState = 'filling';
  watchedObj.errors = '';
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const url = formData.get('url');

  state.form.currentUrl = url;

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
      getRss(url);
    });
});
