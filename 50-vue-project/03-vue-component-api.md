# Vue 3 + 컴포넌트 기반 + 서블릿 API 연결 실습


## 📘 학습 개요

이번 수업에서는 Vue 3의 Composition API + 컴포넌트(Component) 기반 개발 방식을 익히고,
이를 실제 **서블릿 API(백엔드)** 와 연결하여 데이터를 렌더링하는 실습을 진행한다.

Vue의 핵심 철학은 “화면을 작은 컴포넌트로 나누고, 데이터 흐름을 명확하게 설계하는 것”이다.
이 실습을 통해 SPA(Single Page Application) 구조를 자연스럽게 이해하게 된다.


### 📁 프로젝트 폴더 구조

```
/proejct/
    ├── index.html
    ├── /assets/css/vue.css
    ├── /assets/js/auth.js
    ├── /assets/js/board.js
    ├── /assets/js/app.js
```





## 1. index.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>Vue 게시판 SPA (CDN, Composition API)</title>
    <!-- Vue 3 CDN: 전역 변수 Vue 제공 -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <!-- 공통 CSS (네가 만든 vue.css 사용) -->
    <link rel="stylesheet" href="/complete/vue.css" />
  </head>
  <body>
    <div id="app">
      <h1>Vue + 서블릿 게시판 SPA (Composition API)</h1>

      <!-- 로그인 / 로그아웃 / 회원가입 -->
      <div class="card">
        <h2>로그인 / 회원가입</h2>

        <!-- 🔥 여기 추가: 로그인/회원가입 오류/성공 알림 -->
        <div v-if="loginError" class="alert alert-error">{{ loginError }}</div>
        <div v-if="registerError" class="alert alert-error">
          {{ registerError }}
        </div>
        <div v-if="registerSuccess" class="alert alert-success">
          {{ registerSuccess }}
        </div>
        <!-- --------------------------------------- -->

        <!-- 이미 로그인한 경우 -->
        <div v-if="loginUserId" class="row">
          <div>안녕하세요, <strong>{{ loginUserId }}</strong> 님 👋</div>
          <button class="secondary" @click="logout">로그아웃</button>
        </div>

        <!-- 로그인 안 된 경우: 로그인/회원가입 탭 -->
        <div v-else>
          <!-- 모드 전환 버튼 -->
          <div class="row" style="margin-bottom: 12px; gap: 6px">
            <button
              type="button"
              :class="['secondary', { primary: authMode === 'login' }]"
              @click="authMode = 'login'"
            >
              로그인
            </button>
            <button
              type="button"
              :class="['secondary', { primary: authMode === 'register' }]"
              @click="authMode = 'register'"
            >
              회원가입
            </button>
          </div>

          <!-- 로그인 폼 -->
          <form v-if="authMode === 'login'" @submit.prevent="login">
            <div class="row" style="margin-bottom: 8px">
              <div>
                <label>
                  아이디
                  <input v-model="loginForm.id" placeholder="아이디" />
                </label>
              </div>
              <div>
                <label>
                  비밀번호
                  <input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="비밀번호"
                  />
                </label>
              </div>
              <div>
                <button class="primary" type="submit" :disabled="loading">
                  로그인
                </button>
              </div>
            </div>
            <div class="muted">
              ※ 예제용으로 API에 로그인만 요청하고, 클라이언트에서
              localStorage로 로그인 상태를 기억합니다.
            </div>
          </form>

          <!-- 회원가입 폼 -->
          <form v-else @submit.prevent="register">
            <div style="margin-bottom: 8px">
              <label>
                아이디 (최대 20자)
                <input
                  v-model="registerForm.id"
                  placeholder="아이디"
                  maxlength="20"
                />
              </label>
            </div>
            <div style="margin-bottom: 8px">
              <label>
                비밀번호
                <input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="비밀번호"
                />
              </label>
            </div>
            <div style="margin-bottom: 8px">
              <label>
                이메일 (최대 45자)
                <input
                  v-model="registerForm.email"
                  type="email"
                  placeholder="이메일"
                  maxlength="45"
                />
              </label>
            </div>

            <button class="primary" type="submit" :disabled="loading">
              회원가입
            </button>
          </form>
        </div>
      </div>

      <!-- 게시판 목록 / 페이징 -->
      <div class="card">
        <div class="row" style="justify-content: space-between">
          <h2>게시판 목록</h2>
          <div class="row">
            <span class="muted">페이지당</span>
            <!-- v-model.number : 문자열이 아닌 숫자로 바인딩 -->
            <select v-model.number="size" @change="changeSize">
              <option :value="5">5개</option>
              <option :value="10">10개</option>
              <option :value="20">20개</option>
            </select>
          </div>
        </div>

        <!-- 🔥 여기 추가: 목록 관련 에러 -->
        <div v-if="boardError" class="alert alert-error">{{ boardError }}</div>
        <!-- ---------------------------------- -->

        <table>
          <thead>
            <tr>
              <th style="width: 60px">번호</th>
              <th style="width: 120px">작성자</th>
              <th>제목</th>
              <th style="width: 160px" class="right">액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="boards.length === 0">
              <td colspan="3" class="muted">게시글이 없습니다.</td>
            </tr>

            <tr v-for="b in boards" :key="b.idx">
              <td>{{ b.idx }}</td>
              <!-- 🔥 작성자 표시 -->
              <td>{{ b.fk_user_id || '(익명)' }}</td>
              <td>
                <div>{{ b.title || '(제목 없음)' }}</div>

                <!-- 내용 미리보기 (최대 5줄) -->
                <div
                  class="muted small content-preview"
                  :class="{ expanded: expandedBoardId === b.idx }"
                >
                  {{ b.content || '(내용 없음)' }}
                </div>

                <!-- 더보기 / 접기 버튼 -->
                <button
                  v-if="b.content && b.content.length > 120"
                  type="button"
                  class="link-button"
                  @click="toggleContent(b.idx)"
                >
                  {{ expandedBoardId === b.idx ? '접기' : '더보기' }}
                </button>
              </td>
              <td class="right">
                <button
                  class="secondary"
                  @click="startEdit(b)"
                  :disabled="loading"
                >
                  수정
                </button>
                <button
                  class="danger"
                  style="margin-left: 4px"
                  @click="deleteBoard(b.idx)"
                  :disabled="loading"
                >
                  삭제
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 페이징 버튼 -->
        <div
          class="row"
          style="justify-content: space-between; margin-top: 10px"
        >
          <div>
            <button
              class="secondary"
              @click="prevPage"
              :disabled="page <= 1 || loading"
            >
              ◀ 이전
            </button>
            <button
              class="secondary"
              style="margin-left: 4px"
              @click="nextPage"
              :disabled="!hasNext || loading"
            >
              다음 ▶
            </button>
          </div>
          <div class="muted">현재 페이지: {{ page }}</div>
        </div>
      </div>

      <!-- 글쓰기 / 수정 폼 -->
      <div class="card">
        <h2 v-if="boardMode === 'create'">글쓰기</h2>
        <h2 v-else>게시글 수정 (번호: {{ boardForm.idx }})</h2>

        <!-- 🔥 여기 추가: 글쓰기/수정 에러/성공 -->
        <div v-if="formError" class="alert alert-error">{{ formError }}</div>
        <div v-if="formSuccess" class="alert alert-success">
          {{ formSuccess }}
        </div>
        <!-- ---------------------------------- -->

        <!-- submit 시 submitBoard() 호출 -->
        <form @submit.prevent="submitBoard">
          <div style="margin-bottom: 8px">
            <label>
              제목
              <!-- boardForm(reactive) 의 title과 바인딩 -->
              <input
                v-model="boardForm.title"
                placeholder="제목을 입력하세요"
                style="width: 100%; box-sizing: border-box"
                maxlength="45"
              />
            </label>
          </div>
          <div style="margin-bottom: 8px">
            <label>
              내용
              <textarea
                v-model="boardForm.content"
                placeholder="내용을 입력하세요"
              ></textarea>
            </label>
          </div>
          <div class="row" style="justify-content: flex-end">
            <!-- 수정 모드일 때만 취소 버튼 -->
            <button
              v-if="boardMode === 'edit'"
              type="button"
              class="secondary"
              @click="cancelEdit"
              :disabled="loading"
            >
              취소
            </button>
            <!-- 등록/수정 공용 버튼 -->
            <button
              class="primary"
              type="submit"
              :disabled="loading || !loginUserId"
              style="margin-left: 6px"
            >
              {{ boardMode === 'create' ? '등록' : '수정 완료' }}
            </button>
          </div>
          <div class="muted" style="margin-top: 4px">
            ※ "로그인한 아이디가 있어야" 글 작성/수정 버튼이 활성화됩니다.
          </div>
        </form>
      </div>
    </div>

    <!-- 기능 모듈 -->
    <script src="/assets/js/auth.js"></script>
    <script src="/assets/js/board.js"></script>
    <!-- 실제 앱 생성 -->
    <script src="/assets/js/app.js"></script>
  </body>
</html>
```

## 2. vue.css
```css
* {
  box-sizing: border-box;
}
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  margin: 0;
  padding: 0;
  background: #f3f4f6;
  color: #111827;
}
header {
  background: #111827;
  color: #f9fafb;
  padding: 16px 24px;
}
header h1 {
  margin: 0;
  font-size: 1.4rem;
}
header .sub {
  font-size: 0.9rem;
  color: #9ca3af;
  margin-top: 4px;
}
.container {
  max-width: 1000px;
  margin: 24px auto;
  padding: 0 16px 32px;
}
.section {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.section h2 {
  margin-top: 0;
  font-size: 1.1rem;
}
.section-desc {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 10px;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.col {
  flex: 1 1 0;
  min-width: 260px;
}
label {
  display: block;
  font-size: 0.85rem;
  margin: 6px 0 2px;
}
input,
textarea {
  width: 100%;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}
textarea {
  min-height: 120px;
  resize: vertical;
}
button {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
}
button.secondary {
  border-color: #9ca3af;
  background: #e5e7eb;
  color: #111827;
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
.muted {
  font-size: 0.8rem;
  color: #6b7280;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.toolbar-right {
  display: flex;
  gap: 8px;
}
.badge {
  display: inline-block;
  padding: 2px 6px;
  font-size: 0.75rem;
  border-radius: 999px;
  background: #16a34a;
  color: #f9fafb;
  margin-left: 4px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
th,
td {
  border: 1px solid #e5e7eb;
  padding: 6px 8px;
}
th {
  background: #f9fafb;
  text-align: left;
}
.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}
.pagination-controls {
  display: flex;
  gap: 6px;
}
footer {
  text-align: center;
  font-size: 0.8rem;
  color: #6b7280;
  padding: 12px 0 24px;
}
pre {
  background: #f9fafb;
  border-radius: 4px;
  padding: 8px;
  font-size: 0.85rem;
  overflow-x: auto;
}
```


## 3. `auth.js`
```js
// /assets/js/auth.js

(function () {
  // Vue 3 CDN에서 제공하는 전역 객체
  const { ref, reactive, watch, onMounted } = Vue;

  /**
   * 로그인 / 회원가입 로직을 묶어놓은 Composition 함수
   * - jsonFetch : 공통 fetch 헬퍼
   * - loading   : 로딩 상태 ref
   */
  function useAuth(jsonFetch, loading) {
    const authMode = ref("login"); // 'login' | 'register'

    const loginForm = reactive({
      id: "",
      password: "",
    });
    const loginUserId = ref(null);
    const loginError = ref("");

    const registerForm = reactive({
      id: "",
      password: "",
      email: "",
    });
    const registerError = ref("");
    const registerSuccess = ref("");

    // 로그인
    const login = async () => {
      loginError.value = "";

      if (!loginForm.id || !loginForm.password) {
        loginError.value = "아이디와 비밀번호를 입력하세요.";
        return;
      }

      loading.value = true;
      try {
        const { body } = await jsonFetch("/api/user/login", {
          method: "POST",
          body: JSON.stringify({
            id: loginForm.id,
            password: loginForm.password,
          }),
        });

        if (!body.success) {
          loginError.value = body.message || "로그인 실패";
          return;
        }

        // 로그인 성공
        loginUserId.value = loginForm.id;
        loginForm.password = "";
      } catch (e) {
        loginError.value = "서버 오류: " + e.message;
      } finally {
        loading.value = false;
      }
    };

    // 로그아웃
    const logout = () => {
      loginUserId.value = null;
    };

    // 회원가입 (성공 시 자동 로그인)
    const register = async () => {
      registerError.value = "";
      registerSuccess.value = "";

      if (!registerForm.id || !registerForm.password || !registerForm.email) {
        registerError.value = "아이디 / 비밀번호 / 이메일을 모두 입력하세요.";
        return;
      }

      if (registerForm.id.length > 20) {
        registerError.value = "아이디는 최대 20자까지 가능합니다.";
        return;
      }
      if (registerForm.email.length > 45) {
        registerError.value = "이메일은 최대 45자까지 가능합니다.";
        return;
      }

      loading.value = true;
      try {
        const { body } = await jsonFetch("/api/user/register", {
          method: "POST",
          body: JSON.stringify({
            id: registerForm.id,
            password: registerForm.password,
            email: registerForm.email,
          }),
        });

        if (!body.success) {
          registerError.value = body.message || "회원가입에 실패했습니다.";
          return;
        }

        // 회원가입 성공 → 자동 로그인
        loginUserId.value = registerForm.id;
        registerSuccess.value = body.message || "회원가입이 완료되었습니다.";

        // 폼 초기화
        registerForm.id = "";
        registerForm.password = "";
        registerForm.email = "";
      } catch (e) {
        registerError.value = "서버 오류: " + e.message;
      } finally {
        loading.value = false;
      }
    };

    // loginUserId ↔ localStorage 동기화
    watch(loginUserId, (newId) => {
      if (newId) {
        localStorage.setItem("loginUserId", newId);
      } else {
        localStorage.removeItem("loginUserId");
      }
    });

    // 마운트 시 localStorage에서 로그인 복원
    onMounted(() => {
      const saved = localStorage.getItem("loginUserId");
      if (saved) {
        loginUserId.value = saved;
      }
    });

    return {
      authMode,
      loginForm,
      loginUserId,
      loginError,
      registerForm,
      registerError,
      registerSuccess,
      login,
      logout,
      register,
    };
  }

  // 전역에 노출 (app.js에서 사용)
  window.useAuth = useAuth;
})();
```

## 4. `board.js`
```js
// /assets/js/board.js

(function () {
  const { ref, reactive, computed, watch } = Vue;

  /**
   * 게시판(목록/페이징/글쓰기/수정/삭제) 로직
   * - jsonFetch : 공통 fetch 헬퍼
   * - loading   : 로딩 상태 ref
   * - loginUserId : 로그인한 유저 id (ref)
   */
  function useBoard(jsonFetch, loading, loginUserId) {
    // 게시판 목록 / 페이징
    const boards = ref([]);
    const expandedBoardId = ref(null);
    const page = ref(1);
    const size = ref(10);
    const boardError = ref("");

    // 글쓰기 / 수정 폼
    const boardForm = reactive({
      idx: null,
      title: "",
      content: "",
    });
    const boardMode = ref("create"); // 'create' | 'edit'
    const formError = ref("");
    const formSuccess = ref("");

    const hasNext = computed(() => {
      return boards.value.length === size.value;
    });

    // 게시판 목록 조회
    const fetchBoards = async () => {
      loading.value = true;
      boardError.value = "";
      try {
        const url = `/api/board?page=${page.value}&size=${size.value}`;
        const { body } = await jsonFetch(url, { method: "GET" });

        if (!body.success) {
          boardError.value = body.message || "목록 로딩 실패";
          boards.value = [];
          return;
        }

        boards.value = body.data || [];
      } catch (e) {
        boardError.value = "서버 오류: " + e.message;
      } finally {
        loading.value = false;
      }
    };

    const toggleContent = (idx) => {
      if (expandedBoardId.value === idx) {
        expandedBoardId.value = null;
      } else {
        expandedBoardId.value = idx;
      }
    };

    const prevPage = () => {
      if (page.value <= 1) return;
      page.value--;
    };

    const nextPage = () => {
      if (!hasNext.value) return;
      page.value++;
    };

    const changeSize = () => {
      page.value = 1;
    };

    // 글 수정 시작
    const startEdit = (b) => {
      boardMode.value = "edit";
      boardForm.idx = b.idx;
      boardForm.title = b.title || "";
      boardForm.content = b.content || "";
      formError.value = "";
      formSuccess.value = "";
    };

    // 수정 취소
    const cancelEdit = () => {
      boardMode.value = "create";
    };

    // 글 등록/수정
    const submitBoard = async () => {
      formError.value = "";
      formSuccess.value = "";

      if (!loginUserId.value) {
        formError.value = "로그인이 필요합니다.";
        return;
      }

      if (!boardForm.title || !boardForm.content) {
        formError.value = "제목/내용을 모두 입력하세요.";
        return;
      }

      loading.value = true;
      try {
        if (boardMode.value === "create") {
          const { body } = await jsonFetch("/api/board", {
            method: "POST",
            body: JSON.stringify({
              title: boardForm.title,
              content: boardForm.content,
            }),
          });

          if (!body.success) {
            formError.value = body.message || "등록 실패";
            return;
          }

          formSuccess.value = "게시글이 등록되었습니다.";

          // 폼 초기화
          boardForm.title = "";
          boardForm.content = "";

          // 1페이지로 이동 후 목록 새로고침
          page.value = 1;
          await fetchBoards();
        } else {
          const { body } = await jsonFetch("/api/board/" + boardForm.idx, {
            method: "PUT",
            body: JSON.stringify({
              title: boardForm.title,
              content: boardForm.content,
            }),
          });

          if (!body.success) {
            formError.value = body.message || "수정 실패";
            return;
          }

          formSuccess.value = "게시글이 수정되었습니다.";
          await fetchBoards();
          cancelEdit();
        }
      } catch (e) {
        formError.value = "서버 오류: " + e.message;
      } finally {
        loading.value = false;
      }
    };

    // 삭제
    const deleteBoard = async (idx) => {
      if (!loginUserId.value) {
        alert("로그인이 필요합니다.");
        return;
      }
      if (!confirm("정말 삭제하시겠습니까?")) return;

      loading.value = true;
      try {
        const { body } = await jsonFetch("/api/board/" + idx, {
          method: "DELETE",
        });

        if (!body.success) {
          boardError.value = body.message || "삭제 실패";
          return;
        }

        await fetchBoards();
      } catch (e) {
        boardError.value = "서버 오류: " + e.message;
      } finally {
        loading.value = false;
      }
    };

    // page / size 바뀔 때마다 목록 자동 로딩
    watch(
      [page, size],
      () => {
        fetchBoards();
      },
      { immediate: true }
    );

    // boardMode가 create가 되면 폼 초기화
    watch(boardMode, (mode) => {
      if (mode === "create") {
        boardForm.idx = null;
        boardForm.title = "";
        boardForm.content = "";
        formError.value = "";
        formSuccess.value = "";
      }
    });

    return {
      boards,
      expandedBoardId,
      page,
      size,
      boardError,
      boardForm,
      boardMode,
      formError,
      formSuccess,
      hasNext,
      fetchBoards,
      prevPage,
      nextPage,
      changeSize,
      startEdit,
      cancelEdit,
      submitBoard,
      deleteBoard,
      toggleContent,
    };
  }

  window.useBoard = useBoard;
})();
```

## 5. `app.js`
```js
// /assets/js/app.js

(function () {
  const { createApp, ref } = Vue;

  /**
   * 공통 JSON fetch 헬퍼
   */
  const createJsonFetch = () => {
    return async (url, options = {}) => {
      const opt = {
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      };

      const res = await fetch(url, opt);
      const text = await res.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error("JSON 파싱 오류: " + text);
      }
      return { status: res.status, body: json };
    };
  };

  createApp({
    setup() {
      const loading = ref(false);
      const jsonFetch = createJsonFetch();

      // 전역에 붙어 있는 useAuth / useBoard 사용
      const auth = window.useAuth(jsonFetch, loading);
      const board = window.useBoard(jsonFetch, loading, auth.loginUserId);

      return {
        loading,
        ...auth,
        ...board,
      };
    },
  }).mount("#app");
})();
```


## 🧩 실습 / 과제

1. http://java.localhost 페이지에서 로그인 및 게시판 관련 기능 구현해본다.