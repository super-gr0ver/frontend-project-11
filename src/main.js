import './style.css';

import onChange from 'on-change';
import * as yup from 'yup';
import * as _ from 'lodash';
import i18n from 'i18next';
import view from './view.js';
import resources from './locales/ru.js';

const state = {
  lang: 'ru',
  form: {
    currentUrl: '',
  },
  urls: [],
  processState: '',
  errors: '',
};

const form = document.querySelector('.rss-form');

const i18nextInstance = i18n.createInstance();
const run = async () => {
  await i18nextInstance.init({
    lng: state.lang,
    resources,
  });
};
run();

const getSchema = (urls) => yup.object().shape({
  currentUrl: yup
    .string()
    .url(i18nextInstance.t('formErrors.url'))
    .trim()
    .notOneOf(urls, i18nextInstance.t('formErrors.exist')),
});

const validate = (fields, urls) => {
  const schema = getSchema(urls);
  return schema.validate(fields, { abortEarly: false })
    .then(() => { })
    .catch((e) => _.keyBy(e.inner, 'path'));
};

const watchedObj = onChange(state, () => view(state));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  state.form.currentUrl = url;

  const error = validate(state.form, state.urls)
    .then((data) => {
      if (Object.keys(data).length !== 0) {
        watchedObj.errors = data.currentUrl.message;
      }
    })
    .catch(() => {
      watchedObj.errors = '';
      watchedObj.urls.push(url);
    });

  // watchedObj.errors = Object.keys(error).length !== 0 ? error.url.message : '';
});
