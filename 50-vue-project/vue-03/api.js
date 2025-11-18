async function get_board(idx, page, size) {
  try {
    const path = idx == null ? "" : "/" + idx;

    page = page == null ? "" : page;
    size = size == null ? "" : size;

    let param = "";

    if (path === "") {
      if (page !== "") param += "&page=" + encodeURIComponent(page);
      if (size !== "") param += "&size=" + encodeURIComponent(size);
      if (param !== "") param = "?" + param.substring(1);
    }

    const res = await fetch("/api/board" + path + param);
    const data = await res.json();
    return data; // { success, message, data: { items, page, size, totalCount, totalPages } }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function post_board(title, content) {
  try {
    const res = await fetch("/api/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        content: content,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

async function put_board(idx, title, content) {
  try {
    idx = idx == null ? "" : "/" + idx;
    const res = await fetch("/api/board" + idx, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        content: content,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

async function delete_board(idx) {
  try {
    idx = idx == null ? "" : "/" + idx;
    const res = await fetch("/api/board" + idx, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

async function user_login(id, password) {
  try {
    const res = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        password: password,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

async function user_register(id, password, email) {
  try {
    const res = await fetch("/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        password: password,
        email: email,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

async function user_logout() {
  try {
    const res = await fetch("/api/user/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}
