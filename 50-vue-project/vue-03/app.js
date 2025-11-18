const { createApp, ref, onMounted, computed, nextTick } = Vue;

createApp({
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

      const blockSize = 10; // 한 번에 보여줄 페이지 수
      const current = currentPage.value;

      const startPage = Math.floor((current - 1) / blockSize) * blockSize + 1;
      let endPage = startPage + blockSize - 1;

      if (endPage > totalPages.value) {
        endPage = totalPages.value;
      }

      for (let p = startPage; p <= endPage; p++) {
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
