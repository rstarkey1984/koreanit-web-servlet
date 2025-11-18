# Vue 3 + 컴포넌트 기반 + 서블릿 API 연결 실습


## 📘 학습 개요

이번 수업에서는 Vue 3의 Composition API + 컴포넌트(Component) 기반 개발 방식을 익히고,
이를 실제 **서블릿 API(백엔드)** 와 연결하여 데이터를 렌더링하는 실습을 진행한다.

Vue의 핵심 철학은 “화면을 작은 컴포넌트로 나누고, 데이터 흐름을 명확하게 설계하는 것”이다.
이 실습을 통해 SPA(Single Page Application) 구조를 자연스럽게 이해하게 된다.


### 📁 프로젝트 폴더 구조

```
/proejct/
    ├── /vue-03/index.html
    ├── /vue-03/style.css
    ├── /vue-03/app.js
    ├── /vue-03/api.js
```

## 페이징에서 항상 쓰는 4개 값

> HTML 어떻게 보여줄지

- page: 지금 몇 번째 페이지? (1, 2, 3, …)

- size: 한 페이지에 몇 개씩 보여줄지 (10, 20…)

- totalCount: 전체 글 수 (DB에서 COUNT(*))

- totalPages: 전체 페이지 수
→ totalPages = (totalCount + size - 1) / size (올림)

> DB에서는 이걸로 offset, limit 계산:

- offset = (page - 1) * size

- limit = size

## 1. `api.js`
```js
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
```

## 2. index.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>로그인 + 게시판 + 페이징</title>

    <!-- 게시판 전용 CSS -->
    <link rel="stylesheet" href="style.css" />

    <!-- Vue 3 CDN -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

    <!-- API 호출 함수들 (서버 통신) -->
    <script src="api.js"></script>
  </head>

  <body>
    <div id="app">
      <div class="container">
        <!-- 로그인 / 회원가입 -->
        <section>
          <div class="flex-between">
            <h1>로그인</h1>
            <span v-if="isLogin">😊 {{ login_user_id }} 님 환영합니다.</span>
          </div>

          <p v-if="login_error_msg" class="alert-error">
            {{ login_error_msg }}
          </p>

          <!-- 로그인 O -->
          <form v-if="isLogin" @submit.prevent="logout" class="card">
            <div class="flex-between">
              <span>현재 로그인: <strong>{{ login_user_id }}</strong></span>
              <button type="submit" class="secondary">로그아웃</button>
            </div>
          </form>

          <!-- 로그인 X -->
          <div v-else>
            <!-- 로그인 폼 -->
            <form @submit.prevent="login" class="card">
              <h2 style="margin-top: 0; margin-bottom: 12px">로그인</h2>

              <label>아이디</label>
              <input type="text" v-model="input_user_id" />

              <label class="mt-8">비밀번호</label>
              <input type="password" v-model="input_user_password" />

              <div class="text-right mt-8">
                <button class="primary">로그인</button>
              </div>
            </form>

            <!-- 회원가입 결과/에러 -->
            <p v-if="register_error_msg" class="alert-error">
              {{ register_error_msg }}
            </p>
            <p v-if="register_success_msg" class="alert-success">
              {{ register_success_msg }}
            </p>

            <!-- 회원가입 폼 -->
            <form @submit.prevent="register" class="card">
              <h2 style="margin-top: 0; margin-bottom: 12px">회원가입</h2>

              <label>아이디</label>
              <input
                type="text"
                v-model="reg_user_id"
                placeholder="아이디를 입력하세요"
              />

              <label class="mt-8">비밀번호</label>
              <input
                type="password"
                v-model="reg_user_password"
                placeholder="비밀번호를 입력하세요"
              />

              <label class="mt-8">이메일</label>
              <input
                type="text"
                v-model="reg_user_email"
                placeholder="이메일을 입력하세요"
              />

              <div class="text-right mt-8">
                <button class="secondary">회원가입</button>
              </div>
            </form>
          </div>
        </section>

        <hr />

        <!-- 글쓰기 -->
        <section id="writeSection">
          <div class="flex-between">
            <h2>{{ write_edit_str }}</h2>
            <button
              v-show="btn_edit_cancel_show"
              @click="btn_edit_cancel"
              type="button"
              class="secondary"
            >
              취소
            </button>
          </div>

          <p v-if="board_error_msg" class="alert-error">
            {{ board_error_msg }}
          </p>

          <form @submit.prevent="write" class="card">
            <p v-if="!isLogin" class="alert-error">
              글쓰기는 로그인 후 이용 가능합니다.
            </p>

            <label>제목</label>
            <input
              id="titleInput"
              type="text"
              v-model="input_title"
              :disabled="!isLogin"
              maxlength="45"
            />

            <label class="mt-8">내용</label>
            <textarea
              v-model="textarea_content"
              rows="6"
              :disabled="!isLogin"
            ></textarea>

            <div class="text-right mt-8">
              <button class="primary" :disabled="!isLogin">
                {{ btn_write_show ? "등록" : "수정하기" }}
              </button>
            </div>
          </form>
        </section>

        <hr />

        <!-- 게시글 상세보기 -->
        <section id="detailSection" v-if="selectedBoard">
          <div class="card">
            <div class="flex-between">
              <h2>게시글 상세</h2>
              <button type="button" class="secondary" @click="closeDetail">
                닫기
              </button>
            </div>

            <p class="detail-title">{{ selectedBoard.title }}</p>

            <p class="detail-meta">
              번호: {{ selectedBoard.idx }} · 작성자: {{
              selectedBoard.fk_user_id }} · 작성일: {{ selectedBoard.regDate }}
            </p>

            <div class="detail-content">{{ selectedBoard.content }}</div>
          </div>
        </section>

        <hr />

        <!-- 게시판 -->
        <section>
          <div class="flex-between">
            <h2>게시글 목록</h2>
            <span class="board-summary">
              총 {{ totalCount }} 건 ({{ currentPage }} / {{ totalPages }}
              페이지)
            </span>
          </div>

          <!-- 목록 -->
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>내용</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>액션</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="board_list.length === 0">
                <td colspan="6">게시글이 없습니다.</td>
              </tr>

              <tr v-for="b in board_list" :key="b.idx">
                <td>{{ b.idx }}</td>

                <!-- 제목: 한 줄 말줄임 + 클릭 시 상세보기 -->
                <td
                  class="col-title clickable-cell"
                  :title="b.title"
                  @click="showDetail(b)"
                >
                  {{ b.title }}
                </td>

                <!-- 내용: 여러 줄 중 일부만 + 클릭 시 상세보기 -->
                <td
                  class="col-content clickable-cell"
                  :title="b.content"
                  @click="showDetail(b)"
                >
                  <div class="col-content-text">{{ b.content }}</div>
                </td>

                <td>{{ b.fk_user_id }}</td>
                <td>{{ b.regDate }}</td>
                <td>
                  <button
                    v-if="b.fk_user_id === login_user_id"
                    class="secondary"
                    @click="btn_edit_board(b)"
                  >
                    수정
                  </button>
                  <button
                    v-if="b.fk_user_id === login_user_id"
                    class="danger ml-4"
                    @click="btn_delete_board(b.idx)"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 페이징 -->
          <div class="mt-16 pagination text-center">
            <button
              class="secondary"
              @click="goPage(currentPage - 1)"
              :disabled="currentPage <= 1"
            >
              이전
            </button>

            <button
              v-for="p in pageNumbers"
              :key="p"
              class="secondary"
              @click="goPage(p)"
              :disabled="p === currentPage"
              :style="p === currentPage ? 'font-weight:bold;text-decoration:underline' : ''"
            >
              {{ p }}
            </button>

            <button
              class="secondary"
              @click="goPage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
            >
              다음
            </button>
          </div>
        </section>
      </div>
    </div>

    <script src="app.js"></script>
  </body>
</html>
```

## 3. `app.js`
```js
const { createApp, ref, onMounted, computed, nextTick } = Vue;

const vm = createApp({
  setup() {
    /* ============================
     *  로그인 상태
     * ============================ */
    const input_user_id = ref("");
    const input_user_password = ref("");
    const login_error_msg = ref("");
    const isLogin = ref(false);
    const login_user_id = ref("");

    const login = async () => {
      try {
        const res = await user_login(
          input_user_id.value,
          input_user_password.value
        );

        if (!res.success) {
          login_error_msg.value = res.message || "로그인에 실패했습니다.";
        } else {
          login_action(res.data || input_user_id.value);
        }
      } catch (err) {
        login_error_msg.value = "로그인 오류";
      }
    };

    const logout = async () => {
      try {
        const res = await user_logout();

        if (!res.success) {
          login_error_msg.value = res.message || "로그아웃 실패";
        } else {
          login_action(null);
        }
      } catch {
        login_error_msg.value = "로그아웃 오류";
      }
    };

    const login_action = (uid) => {
      login_error_msg.value = "";
      input_user_id.value = "";
      input_user_password.value = "";

      if (!uid) {
        localStorage.removeItem("sess_user_id");
        isLogin.value = false;
        login_user_id.value = "";
      } else {
        localStorage.setItem("sess_user_id", uid);
        isLogin.value = true;
        login_user_id.value = uid;
      }
    };

    /* ============================
     *  회원가입 상태
     * ============================ */
    const reg_user_id = ref("");
    const reg_user_password = ref("");
    const reg_user_email = ref("");
    const register_error_msg = ref("");
    const register_success_msg = ref("");

    const register = async () => {
      register_error_msg.value = "";
      register_success_msg.value = "";

      if (
        !reg_user_id.value.trim() ||
        !reg_user_password.value.trim() ||
        !reg_user_email.value.trim()
      ) {
        register_error_msg.value =
          "아이디/비밀번호/이메일을 모두 입력해주세요.";
        return;
      }

      try {
        const res = await user_register(
          reg_user_id.value,
          reg_user_password.value,
          reg_user_email.value
        );

        if (!res.success) {
          register_error_msg.value = res.message || "회원가입에 실패했습니다.";
        } else {
          register_success_msg.value =
            res.message || "회원가입이 완료되었습니다. 로그인 해주세요.";
          // 입력 값 초기화
          reg_user_id.value = "";
          reg_user_password.value = "";
          reg_user_email.value = "";
        }
      } catch (err) {
        register_error_msg.value = "회원가입 중 오류가 발생했습니다.";
      }
    };

    /* ★ 공통: 서버에서 "로그인" 관련 에러 오면 강제 로그아웃 + 안내 */
    const handleAuthError = (res, targetErrorRef, defaultMsg) => {
      if (
        res &&
        typeof res.message === "string" &&
        res.message.includes("로그인")
      ) {
        // 세션 만료 or 미로그인 → 프론트도 로그아웃 상태로 동기화
        login_action(null);
        const msg = "로그인이 만료되었습니다. 다시 로그인 해 주세요.";
        targetErrorRef.value = msg;
        login_error_msg.value = msg; // 로그인 영역에도 같이 표시
        return true; // 로그인 에러 처리했음
      }
      // 로그인 관련 에러가 아니면 false
      targetErrorRef.value = res?.message || defaultMsg;
      return false;
    };

    /* ============================
     *  게시판 상태
     * ============================ */
    const board_error_msg = ref("");
    const board_list = ref([]);

    // 페이징 상태
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalPages = ref(1);
    const totalCount = ref(0);

    // 글쓰기 form
    const input_title = ref("");
    const textarea_content = ref("");

    const write_edit_str = ref("글쓰기");
    const edit_board_info = ref(null);

    const btn_edit_cancel_show = ref(false);
    const btn_write_show = ref(true);

    // 상세보기 대상
    const selectedBoard = ref(null);

    const resetForm = () => {
      input_title.value = "";
      textarea_content.value = "";
      write_edit_str.value = "글쓰기";
      btn_edit_cancel_show.value = false;
      btn_write_show.value = true;
      edit_board_info.value = null;
    };

    /* ============================
     *  목록 조회(페이징)
     * ============================ */
    const get_board_list = async (pageNum = 1) => {
      try {
        const res = await get_board(null, pageNum, pageSize.value);

        if (!res.success) {
          // 목록 조회는 로그인 필요 없으니, 그냥 에러만 표시
          board_error_msg.value = res.message || "게시글 조회 실패";
          return;
        }

        const data = res.data;

        currentPage.value = data.page;
        totalPages.value = data.totalPages;
        totalCount.value = data.totalCount;

        board_list.value = data.items;
        board_error_msg.value = "";
      } catch {
        board_error_msg.value = "게시글 로딩 오류";
      }
    };

    // 페이지 번호 목록 계산 (10개씩)
    const pageNumbers = computed(() => {
      const pages = [];

      const total = totalPages.value;
      const current = currentPage.value;

      const left = 4; // 현재 페이지 왼쪽에 4개
      const right = 4; // 현재 페이지 오른쪽에 4개
      const maxCount = left + 1 + right; // 합계 = 9개

      // 기본 범위
      let startPage = current - left;
      let endPage = current + right;

      // 왼쪽 범위 벗어나면
      if (startPage < 1) {
        endPage += 1 - startPage; // 부족한 만큼 오른쪽에 추가
        startPage = 1;
      }

      // 오른쪽 범위 벗어나면
      if (endPage > total) {
        startPage -= endPage - total; // 부족한 만큼 왼쪽에 추가
        endPage = total;
      }

      // 최소 보정
      if (startPage < 1) startPage = 1;

      // 페이지 번호 만들기
      for (let p = startPage; p <= endPage && pages.length < maxCount; p++) {
        pages.push(p);
      }

      return pages;
    });

    const goPage = (p) => {
      if (p < 1 || p > totalPages.value) return;
      get_board_list(p);
    };

    /* ============================
     *  글쓰기/수정/삭제
     * ============================ */
    const write = async () => {
      if (!isLogin.value) {
        board_error_msg.value = "로그인 후 작성 가능";
        return;
      }

      if (!input_title.value.trim() || !textarea_content.value.trim()) {
        board_error_msg.value = "제목/내용을 입력하세요";
        return;
      }

      // 안전하게 한 번 더 체크 (DB 45자)
      if (input_title.value.length > 45) {
        board_error_msg.value = "제목은 최대 45자까지 입력 가능합니다.";
        return;
      }

      try {
        // 수정 모드
        if (edit_board_info.value) {
          const target = edit_board_info.value;

          const res = await put_board(
            target.idx,
            input_title.value,
            textarea_content.value
          );

          if (!res.success) {
            // ★ 로그인 만료 등 인증 에러 처리
            if (handleAuthError(res, board_error_msg, "수정 실패")) {
              return;
            }
            return;
          }

          // 목록 갱신
          await get_board_list(currentPage.value);
          resetForm();
          return;
        }

        // 신규 등록
        const res = await post_board(input_title.value, textarea_content.value);

        if (!res.success) {
          // ★ 로그인 만료 등 인증 에러 처리
          if (handleAuthError(res, board_error_msg, "등록 실패")) {
            return;
          }
          return;
        }

        // 등록 후 첫 페이지 다시 읽기
        await get_board_list(1);
        resetForm();
      } catch {
        board_error_msg.value = "글 저장 오류";
      }
    };

    const btn_edit_board = (b) => {
      if (b.fk_user_id !== login_user_id.value) {
        board_error_msg.value = "본인 글만 수정 가능";
        return;
      }

      edit_board_info.value = b;
      write_edit_str.value = "글 수정";
      btn_edit_cancel_show.value = true;
      btn_write_show.value = false;

      input_title.value = b.title;
      textarea_content.value = b.content;

      // DOM 업데이트 후 제목 input에 포커스 + 스크롤
      nextTick(() => {
        const titleEl = document.getElementById("titleInput");
        if (titleEl) {
          titleEl.focus();
          titleEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    };

    const btn_delete_board = async (idx) => {
      if (!confirm("삭제하시겠습니까?")) return;

      try {
        const res = await delete_board(idx);

        if (!res.success) {
          // ★ 로그인 만료 등 인증 에러 처리
          if (handleAuthError(res, board_error_msg, "삭제 실패")) {
            return;
          }
          return;
        }

        // 현재 페이지 다시 로딩
        await get_board_list(currentPage.value);
      } catch {
        board_error_msg.value = "삭제 오류";
      }
    };

    const btn_edit_cancel = () => resetForm();

    /* ============================
     *  상세보기
     * ============================ */
    const showDetail = (b) => {
      selectedBoard.value = b;

      nextTick(() => {
        const detailEl = document.getElementById("detailSection");
        if (detailEl) {
          detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    };

    const closeDetail = () => {
      selectedBoard.value = null;
    };

    /* ============================
     *  OnMounted
     * ============================ */
    onMounted(() => {
      const saved = localStorage.getItem("sess_user_id");
      if (saved) login_action(saved);

      get_board_list(1);
    });

    /* ============================
     *  반환
     * ============================ */
    return {
      // 로그인
      input_user_id,
      input_user_password,
      login_error_msg,
      isLogin,
      login_user_id,
      login,
      logout,

      // 회원가입
      reg_user_id,
      reg_user_password,
      reg_user_email,
      register_error_msg,
      register_success_msg,
      register,

      // 게시판
      board_error_msg,
      board_list,

      // 페이징
      currentPage,
      totalPages,
      totalCount,
      pageNumbers,
      goPage,

      // 글쓰기
      input_title,
      textarea_content,
      write_edit_str,
      btn_edit_cancel_show,
      btn_write_show,
      write,
      btn_edit_board,
      btn_edit_cancel,
      btn_delete_board,

      // 상세보기
      selectedBoard,
      showDetail,
      closeDetail,
    };
  },
}).mount("#app");
```

## 4. style.css
```css
* {
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f3f4f6;
}

.container {
  max-width: 960px;
  margin: 40px auto;
  background: #ffffff;
  border-radius: 8px;
  padding: 24px 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

h1,
h2 {
  margin: 0 0 16px;
}

hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 24px 0;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card {
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  margin-bottom: 16px;
}

.alert-error {
  color: #b91c1c;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.alert-success {
  color: #15803d;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

label {
  font-weight: 600;
  display: inline-block;
  margin-bottom: 4px;
}

input[type="text"],
input[type="password"],
textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
}

textarea {
  resize: vertical;
}

button {
  padding: 6px 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

button.primary {
  background-color: #2563eb;
  color: white;
}

button.secondary {
  background-color: #6b7280;
  color: white;
}

button.danger {
  background-color: #dc2626;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 0.95rem;
  table-layout: fixed;
}

th,
td {
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  text-align: center;
}
th:nth-child(6),
td:nth-child(6) {
  width: 120px;
  white-space: nowrap;
}

td:nth-child(6) button {
  padding: 4px 8px; /* 버튼 크기 조절 */
  font-size: 0.85rem;
  white-space: nowrap;
}

thead {
  background-color: #f9fafb;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.mt-8 {
  margin-top: 8px;
}

.mt-16 {
  margin-top: 16px;
}

.pagination button {
  margin: 0 4px;
}

/* 게시글 목록 상단 요약 텍스트 */
.board-summary {
  font-size: 0.9rem;
  color: #6b7280;
}

/* 제목: 한 줄 말줄임 */
.col-title {
  text-align: left;
  padding-left: 10px;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 내용 셀 – 폭만 관리 */
.col-content {
  text-align: left;
  padding-left: 10px;
  max-width: 320px;
}

/* 내용 텍스트: 2줄 말줄임 */
.col-content-text {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 2줄까지만 표시 */
  -webkit-box-orient: vertical;
  overflow: hidden;

  white-space: normal; /* 줄바꿈 허용 */
  word-break: break-all; /* 단어 길어도 줄바꿈 */
  line-height: 1.4; /* 줄 높이 */
}

/* 버튼 사이 간격 */
.ml-4 {
  margin-left: 4px;
}

/* 제목/내용 클릭 가능 표시 */
.clickable-cell {
  cursor: pointer;
  color: #1d4ed8;
}

.clickable-cell:hover {
  text-decoration: underline;
}

/* 상세보기 제목 */
.detail-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 8px 0;
}

/* 상세보기 메타 정보 */
.detail-meta {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 12px;
}

/* 상세보기 내용 (줄바꿈 유지) */
.detail-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 10px;
}
```






## 🧩 실습 / 과제

1. http://java.localhost 페이지에서 로그인 및 게시판 관련 기능 구현해본다.