// Vue 3 Composition API 기능들을 구조 분해 할당
const { createApp, ref, reactive, computed, onMounted } = Vue;

createApp({
  // setup() : Composition API의 진입점
  setup() {
    // ==========================
    // 1. 상태(state) 정의
    // ==========================

    // 로그인 폼: 여러 필드가 있는 객체이므로 reactive 로 묶음
    const loginForm = reactive({
      id: "",
      password: "",
    });

    // 현재 로그인한 사용자 아이디 (primitive 값이므로 ref)
    const loginUserId = ref(null);

    // 로그인 에러 메시지
    const loginError = ref("");

    // 게시판 목록 (배열이지만, "전체를 바꿔치기"가 많으니 ref([]) 사용)
    const boards = ref([]);

    // 페이지 번호, 페이지 크기
    const page = ref(1);
    const size = ref(10);

    // 목록/삭제 관련 에러 메시지
    const boardError = ref("");

    // 글쓰기/수정 폼 : 여러 필드가 있으니 reactive
    const boardForm = reactive({
      idx: null,
      title: "",
      content: "",
    });

    const boardMode = ref("create"); // 'create' | 'edit'

    // 폼 에러/성공 메시지
    const formError = ref("");
    const formSuccess = ref("");

    // 공통 로딩 상태
    const loading = ref(false);

    // ==========================
    // 2. computed(계산된 값)
    // ==========================

    // hasNext : "다음 페이지가 있는지"를 boards, size 에서 계산
    // - 실제로는 서버에서 totalCount 를 내려주는 게 정확하지만
    //   여기서는 "받은 개수 == size" 면 다음 페이지가 있다고 가정
    const hasNext = computed(() => {
      return boards.value.length === size.value;
    });

    // (예시) 로그인 여부를 computed 로 만들 수도 있음
    // const isLoggedIn = computed(() => !!loginUserId.value);

    // ==========================
    // 3. 공통 JSON 요청 헬퍼 함수
    // ==========================

    /**
     * JSON 기반 API 요청을 위한 fetch 래퍼
     * - url: 요청 주소
     * - options: fetch 옵션 (method, body 등)
     * - 항상 { status, body } 형태로 반환
     */
    const jsonFetch = async (url, options = {}) => {
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

    // ==========================
    // 4. 동작(method)들
    // ==========================

    // ---- 로그인 ----
    const login = async () => {
      loginError.value = "";

      if (!loginForm.id || !loginForm.password) {
        loginError.value = "아이디와 비밀번호를 입력하세요.";
        return;
      }

      loading.value = true;
      try {
        const { status, body } = await jsonFetch("/api/user/login", {
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

        // 로그인 성공 시, 아이디만 저장 (예제)
        loginUserId.value = loginForm.id;
        localStorage.setItem("loginUserId", loginUserId.value);

        // 비밀번호는 바로 지움
        loginForm.password = "";
      } catch (e) {
        console.error(e);
        loginError.value = "서버 오류: " + e.message;
      } finally {
        loading.value = false;
      }
    };

    const logout = () => {
      loginUserId.value = null;
      localStorage.removeItem("loginUserId");
    };

    // ---- 게시판 목록 조회 ----
    const fetchBoards = async () => {
      boardError.value = "";
      loading.value = true;
      try {
        const url = "/api/board?page=" + page.value + "&size=" + size.value;
        const { status, body } = await jsonFetch(url, {
          method: "GET",
        });

        if (!body.success) {
          boardError.value = body.message || "목록을 가져오는 데 실패했습니다.";
          boards.value = [];
          return;
        }

        boards.value = body.data || [];
        // hasNext 는 computed 이므로 여기서 따로 건드릴 필요 없음
      } catch (e) {
        console.error(e);
        boardError.value = "서버 오류: " + e.message;
        boards.value = [];
      } finally {
        loading.value = false;
      }
    };

    const prevPage = () => {
      if (page.value <= 1) return;
      page.value -= 1;
      fetchBoards();
    };

    const nextPage = () => {
      if (!hasNext.value) return;
      page.value += 1;
      fetchBoards();
    };

    const changeSize = () => {
      // 페이지 크기 변경 시 1페이지부터 조회
      page.value = 1;
      fetchBoards();
    };

    // ---- 글 수정 모드 진입 ----
    const startEdit = (board) => {
      boardMode.value = "edit";
      boardForm.idx = board.idx;
      boardForm.title = board.title || "";
      boardForm.content = board.content || "";
      formError.value = "";
      formSuccess.value = "";
    };

    const cancelEdit = () => {
      boardMode.value = "create";
      boardForm.idx = null;
      boardForm.title = "";
      boardForm.content = "";
      formError.value = "";
      formSuccess.value = "";
    };

    // ---- 글 생성/수정 제출 ----
    const submitBoard = async () => {
      formError.value = "";
      formSuccess.value = "";

      if (!loginUserId.value) {
        formError.value = "글을 작성/수정하려면 로그인이 필요합니다.";
        return;
      }
      if (!boardForm.title || !boardForm.content) {
        formError.value = "제목과 내용을 모두 입력하세요.";
        return;
      }

      loading.value = true;
      try {
        if (boardMode.value === "create") {
          // 새 글 등록
          const { status, body } = await jsonFetch("/api/board", {
            method: "POST",
            body: JSON.stringify({
              title: boardForm.title,
              content: boardForm.content,
            }),
          });

          if (!body.success) {
            formError.value = body.message || "게시글 등록에 실패했습니다.";
            return;
          }

          formSuccess.value = "게시글이 등록되었습니다.";
          boardForm.title = "";
          boardForm.content = "";
          page.value = 1;
          await fetchBoards();
        } else {
          // 기존 글 수정
          const idx = boardForm.idx;
          const { status, body } = await jsonFetch("/api/board/" + idx, {
            method: "PUT",
            body: JSON.stringify({
              title: boardForm.title,
              content: boardForm.content,
            }),
          });

          if (!body.success) {
            formError.value = body.message || "게시글 수정에 실패했습니다.";
            return;
          }

          formSuccess.value = "게시글이 수정되었습니다.";
          await fetchBoards();
          cancelEdit();
        }
      } catch (e) {
        console.error(e);
        formError.value = "서버 오류: " + e.message;
      } finally {
        loading.value = false;
      }
    };

    // ---- 삭제 ----
    const deleteBoard = async (idx) => {
      if (!loginUserId.value) {
        alert("삭제하려면 로그인이 필요합니다.");
        return;
      }
      if (!confirm("정말 삭제하시겠습니까?")) return;

      loading.value = true;
      boardError.value = "";
      try {
        const { status, body } = await jsonFetch("/api/board/" + idx, {
          method: "DELETE",
        });

        if (!body.success) {
          boardError.value = body.message || "삭제에 실패했습니다.";
          return;
        }

        await fetchBoards();
      } catch (e) {
        console.error(e);
        boardError.value = "서버 오류: " + e.message;
      } finally {
        loading.value = false;
      }
    };

    // ==========================
    // 5. 라이프사이클(onMounted)
    // ==========================

    // 컴포넌트가 화면에 올라간 뒤 실행
    onMounted(() => {
      // 로컬스토리지에서 로그인 아이디 복원
      const savedId = localStorage.getItem("loginUserId");
      if (savedId) {
        loginUserId.value = savedId;
      }
      // 첫 페이지 목록 로딩
      fetchBoards();
    });

    // ==========================
    // 6. 템플릿에 노출할 값/함수 반환
    // ==========================
    // 반환한 것만 템플릿에서 사용할 수 있음
    return {
      // 상태
      loginForm,
      loginUserId,
      loginError,
      boards,
      page,
      size,
      boardError,
      boardForm,
      boardMode,
      formError,
      formSuccess,
      loading,

      // computed
      hasNext,

      // 메서드
      login,
      logout,
      fetchBoards,
      prevPage,
      nextPage,
      changeSize,
      startEdit,
      cancelEdit,
      submitBoard,
      deleteBoard,
    };
  },
}).mount("#app");
