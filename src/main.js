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
    url: '',
  },
  rssLinks: {},
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

// const schema = yup.string().url('Ссылка должна быть валидным URL');
const schema = yup.object().shape({
  url: yup.string()
    .url((i18nextInstance.t('formErrors.url'))),
  // .notOneOf(loadedFeeds, t('urlExist')),
});

const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};

const watchedObj = onChange(state, () => view(state));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  watchedObj.form.url = url;
  const error = validate(watchedObj.form);
  watchedObj.errors = Object.keys(error).length !== 0 ? error.url.message : '';
});
