let url = new URL(location.href);
localStorage.token = url.searchParams.get("token");
localStorage.api_key = url.searchParams.get("api_key");
localStorage.secret = url.searchParams.get("secret");
window.close();
