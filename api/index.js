import axios from "axios";

const PIXELBAY_API_KEY = "43820400-fc1ad846e8432b85c3fd38166";
const apiUrl = `https://pixabay.com/api/?key=${PIXELBAY_API_KEY}`;

const formatedUrl = (params) => {
  let url = apiUrl + "&per_page=25&safesearch=false&editors_choice=true";
  if (!params) return url;
  let paramKeys = Object.keys(params);
  paramKeys.map((key) => {
    let value = key == "q" ? encodeURIComponent(params[key]) : params[key];
    url += `&${key}=${value}`;
  });

  console.log("Final Url", url);
  return url;
};

export const apiCall = async (params) => {
  try {
    const response = await axios.get(formatedUrl(params));
    const { data } = response;
    return { success: true, data };
  } catch (err) {
    console.log("Got Error", err.message);
    return { success: "false", msg: err.message };
  }
};
