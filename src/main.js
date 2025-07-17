import "./style.css";

import onChange from "on-change";
import * as yup from "yup";
import * as _ from "lodash";
import i18n from "i18next";
import view from "./view.js";
import resources from "./locales/ru.js";

const state = {
  lang: "ru",
  form: {
    currentUrl: "",
  },
  urls: [],
  processState: "",
  errors: "",
};

const form = document.querySelector(".rss-form");
const input = document.querySelector(".form-control");

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
    url: () => i18nextInstance.t("formErrors.url"),
  },
  mixed: {
    notOneOf: () => i18nextInstance.t("formErrors.exist"),
  },
});

const getSchema = (urls) =>
  yup.object().shape({
    currentUrl: yup.string().url().trim().notOneOf(urls),
  });

const validate = (fields, urls) => {
  const schema = getSchema(urls);
  return schema
    .validate(fields, { abortEarly: false })
    .then(() => {})
    .catch((e) => _.keyBy(e.inner, "path"));
};

const watchedObj = onChange(state, () => view(state));

input.addEventListener("input", () => {
  watchedObj.processState = "filling";
  watchedObj.errors = "";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const url = formData.get("url");

  state.form.currentUrl = url;

  validate(state.form, state.urls)
    .then((errorObj) => {
      if (Object.keys(errorObj).length !== 0) {
        state.errors = errorObj.currentUrl.message;
        watchedObj.processState = "error";
      }
    })
    .catch(() => {
      watchedObj.errors = "";
      watchedObj.urls.push(url);
      watchedObj.processState = "processed";
    });
});
// Не правильно работает

// const { value } = e.target;
