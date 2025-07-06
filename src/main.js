import './style.css';
import onChange from 'on-change';
import * as yup from 'yup';
import * as _ from 'lodash';
import view from './view.js';

const state = {
  formUrl: '',
  rssLinks: {},
  processState: '',
  errors: '',
};

const form = document.querySelector('.rss-form');

const schema = yup.string().url('Ссылка должна быть валидным URL');

// const formSchema = object().shape({
//   inputValue: string()
//     .url(t('Ссылка должна быть валидным URL'))
//     .required(t('notEmpty'))
//     .notOneOf(loadedFeeds, t('urlExist')),
// });

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
  watchedObj.formUrl = url;
  const error = validate(watchedObj.formUrl);
  watchedObj.errors = Object.keys(error).length !== 0 ? error[''].message : '';
});
