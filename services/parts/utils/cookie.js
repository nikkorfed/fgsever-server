exports.parseSetCookie = (cookies) => {
  const cookiesEntries = cookies.map((cookie) => {
    cookie = cookie.slice(0, cookie.indexOf(";"));

    const equalSignIndex = cookie.indexOf("=");
    const key = cookie.slice(0, equalSignIndex);
    const value = cookie.slice(equalSignIndex + 1);

    return [key, value];
  });

  const cookiesObject = Object.fromEntries(cookiesEntries);
  const result = Object.entries(cookiesObject)
    .map((entry) => entry.join("="))
    .join("; ");

  return result;
};
