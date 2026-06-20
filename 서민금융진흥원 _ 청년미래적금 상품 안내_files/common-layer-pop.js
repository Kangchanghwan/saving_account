/* ============================================
   공통 메시지 팝업 스크립트
   ============================================ */

(function () {
    "use strict";

    if (typeof window.jQuery !== "function") {
        throw new Error("common-layer-pop.js requires jQuery 3.3.1.");
    }

    let layerPopCallback = null;
    let layerPopXCallback = null;
    let titleLayerPopCallback = null;
    let layerConfirmYesCallback = null;
    let layerConfirmNoCallback = null;
    let schedulePopupLastFocusedElement = null;

    /**
     * 공통 알럿 오버레이를 flex 레이아웃으로 연다.
     * @param {string} selector 대상 오버레이 셀렉터
     */
    function openAlertOverlay(selector) {
        $(selector).css("display", "flex");
    }

    /**
     * 공통 팝업 오픈 상태를 페이지 루트에 반영한다.
     * @param {boolean} isOpen 팝업 오픈 여부
     */
    function syncLayerPopPageState(isOpen) {
        // verify 계열 페이지는 루트에 모달 오픈 상태 클래스를 같이 건다.
        $("#identity-verification-flow").toggleClass(
            "verify-modal-open",
            isOpen,
        );
    }

    /**
     * 공통 팝업을 닫고 필요 시 콜백을 실행한다.
     */
    function closeLayerPop() {
        const callback = layerPopCallback;

        $("#divLayerPop").hide();
        syncLayerPopPageState(false);
        layerPopCallback = null;

        if (typeof callback === "function") {
            callback();
        }
    }

    /**
     * X 버튼이 있는 공통 팝업을 확인 버튼으로 닫고 콜백을 실행한다.
     */
    function closeLayerPopXWithCallback() {
        const callback = layerPopXCallback;

        $("#divLayerPopX").hide();
        syncLayerPopPageState(false);
        layerPopXCallback = null;

        if (typeof callback === "function") {
            callback();
        }
    }

    /**
     * X 버튼이 있는 공통 팝업을 콜백 없이 닫는다.
     */
    function closeLayerPopXWithoutCallback() {
        $("#divLayerPopX").hide();
        syncLayerPopPageState(false);
        layerPopXCallback = null;
    }

    /**
     * 공통 메시지 팝업을 연다.
     * @param {string} msg 표시할 메시지
     * @param {Function} [callBackFunc] 확인 후 실행할 콜백
     */
    window.showLayerPop = function (msg, callBackFunc) {
        $("#divLayerPopMessage").text(msg || "");
        openAlertOverlay("#divLayerPop");
        syncLayerPopPageState(true);
        layerPopCallback =
            typeof callBackFunc === "function" ? callBackFunc : null;
        $("#divLayerPopConfirm").focus();
    };

    /**
     * X 버튼이 있는 공통 메시지 팝업을 연다.
     * @param {string} msg 표시할 메시지
     * @param {Function} [callBackFunc] 확인 후 실행할 콜백
     */
    window.showLayerPopX = function (msg, callBackFunc) {
        $("#divLayerPopXMessage").text(msg || "");
        openAlertOverlay("#divLayerPopX");
        syncLayerPopPageState(true);
        layerPopXCallback =
            typeof callBackFunc === "function" ? callBackFunc : null;
        $("#divLayerPopXClose").focus();
    };

    /**
     * 제목/메시지 공통 팝업을 연다.
     * @param {string} title 표시할 제목
     * @param {string} msg 표시할 메시지
     * @param {Function} [callBackFunc] 확인 후 실행할 콜백
     */
    window.showTitleLayerPop = function (title, msg, callBackFunc) {
        $("#divTitleLayerPopTitle").text(title || "");
        $("#divTitleLayerPopMessage").text(msg || "");
        openAlertOverlay("#divTitleLayerPop");
        syncLayerPopPageState(true);
        titleLayerPopCallback =
            typeof callBackFunc === "function" ? callBackFunc : null;
        $("#divTitleLayerPopConfirm").focus();
    };

    /**
     * 공통 메시지 팝업을 닫는다.
     */
    window.hideLayerPop = function () {
        layerPopCallback = null;
        $("#divLayerPop").hide();
        syncLayerPopPageState(false);
    };

    /**
     * X 버튼이 있는 공통 메시지 팝업을 닫는다.
     */
    window.hideLayerPopX = function () {
        closeLayerPopXWithoutCallback();
    };

    /**
     * 제목/메시지 공통 팝업을 닫는다.
     */
    window.hideTitleLayerPop = function () {
        titleLayerPopCallback = null;
        $("#divTitleLayerPop").hide();
        syncLayerPopPageState(false);
    };

    /**
     * 예/아니오 공통 확인 팝업을 연다.
     * @param {string} msg 표시할 메시지
     * @param {Function} [callBackFuncY] 예 버튼 콜백
     * @param {Function} [callBackFuncN] 아니오 버튼 콜백
     */
    window.showConfirm = function (msg, callBackFuncY, callBackFuncN) {
        $("#divLayerConfirmMessage").text(msg || "");
        openAlertOverlay("#divLayerConfirm");
        syncLayerPopPageState(true);
        layerConfirmYesCallback =
            typeof callBackFuncY === "function" ? callBackFuncY : null;
        layerConfirmNoCallback =
            typeof callBackFuncN === "function" ? callBackFuncN : null;
        $("#divLayerConfirmYes").focus();
    };

    /**
     * 예/아니오 공통 확인 팝업을 닫는다.
     */
    window.hideLayerConfirm = function () {
        layerConfirmYesCallback = null;
        layerConfirmNoCallback = null;
        $("#divLayerConfirm").hide();
        syncLayerPopPageState(false);
    };

    /**
     * 전체 화면 로딩 인디케이터를 연다.
     */
    window.showLoader = function () {
        $(".loader_wrap").show();
    };

    /**
     * 전체 화면 로딩 인디케이터를 닫는다.
     */
    window.hideLoader = function () {
        $(".loader_wrap").hide();
    };

    /** 채팅 버튼 클릭 시 (오픈 전) */
    function onClickChatButton() {
        const curDatetime = new Date();
        const blockDatetime = new Date("2026-06-22T09:00");

        if (Number(curDatetime) <= Number(blockDatetime)) {
            $("#customer-modal").hide();
            showLayerPop('청년미래적금 출시 후 이용 가능합니다.')
            return;
        }

        window.open("https://chat.kinfa.or.kr/?CHANNEL", "_blank")
    }

    function renderCustomerModal() {
        return [
            '<div id="customer-modal" class="customer-modal" style="display: none" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">',
            '    <div class="customer-modal__backdrop" data-customer-modal-close></div>',
            '    <div class="customer-modal__sheet" role="document">',
            '        <div class="customer-modal__handle-area" aria-hidden="true">',
            '            <span class="customer-modal__handle"></span>',
            "        </div>",
            '        <h2 id="customer-modal-title" class="customer-modal__title">상담 지원</h2>',
            '        <ul class="customer-modal__list">',
            "            <li>",
            '                <a class="customer-modal__item" href="tel:1397">',
            '                    <span class="customer-modal__item-media">',
            '                        <img class="customer-modal__item-icon" src="../resources/images/yfs/common/icon_customer_headset_mic.svg" alt="" />',
            "                    </span>",
            '                    <span class="customer-modal__item-label">청년금융콜센터(☎ 1397 → 3번)</span>',
            '                    <img class="customer-modal__item-arrow" src="../resources/images/yfs/common/icon_customer_modal_arrow.svg" alt="" />',
            "                </a>",
            "            </li>",
            "            <li>",
            '                <a class="customer-modal__item" onclick="onClickChatButton()">',
            '                    <span class="customer-modal__item-media">',
            '                        <img class="customer-modal__item-icon" src="../resources/images/yfs/common/icon_customer_chat.svg" alt="" />',
            "                    </span>",
            '                    <span class="customer-modal__item-label">1:1 채팅상담</span>',
            '                    <img class="customer-modal__item-arrow" src="../resources/images/yfs/common/icon_customer_modal_arrow.svg" alt="" />',
            "                </a>",
            "            </li>",
            "        </ul>",
            "    </div>",
            "</div>",
        ].join("");
    }

    function renderSchedulePopupModal() {
        return [
            '<div id="schedule-popup-modal" class="schedule-popup-modal main-info-popup" role="dialog" aria-modal="true" aria-labelledby="schedule-popup-modal-title" hidden>',
            '    <div class="schedule-popup-modal__backdrop" data-schedule-popup-close aria-hidden="true"></div>',
            '    <div class="schedule-popup-modal__dialog" role="document" tabindex="-1" data-schedule-popup-initial-focus>',
            '        <div class="schedule-popup-modal__handle-area" aria-hidden="true">',
            '            <span class="schedule-popup-modal__handle"></span>',
            "        </div>",
            '        <div class="schedule-popup-modal__header">',
            '            <h2 id="schedule-popup-modal-title" class="schedule-popup-modal__title">일정 안내</h2>',
            '            <button class="schedule-popup-modal__close" type="button" aria-label="일정 안내 팝업 닫기" data-schedule-popup-close></button>',
            "        </div>",
            '        <div class="schedule-popup-modal__body">',
            '            <img class="schedule-popup-modal__image" src="../resources/images/yfs/main/join_date.jpg" width="4500" height="6000" alt="청년미래적금 일정 안내" />',
            "        </div>",
            "    </div>",
            "</div>",
        ].join("");
    }

    function getSchedulePopupModal() {
        return document.getElementById("schedule-popup-modal");
    }

    function isSchedulePopupVisible() {
        const modal = getSchedulePopupModal();

        return Boolean(
            modal &&
            !modal.hidden &&
            (modal.offsetWidth ||
                modal.offsetHeight ||
                modal.getClientRects().length),
        );
    }

    function resetSchedulePopupDialog() {
        const modal = getSchedulePopupModal();
        const dialog = modal
            ? modal.querySelector("[data-schedule-popup-initial-focus]")
            : null;

        if (!dialog) {
            return;
        }

        dialog.classList.remove("is-dragging", "is-closing");
        dialog.style.transform = "";
    }

    function ensureSchedulePopupModal() {
        const isVisible = isSchedulePopupVisible();

        $("#schedule-popup-modal").remove();
        $("body").append(renderSchedulePopupModal());

        if (isVisible) {
            const modal = getSchedulePopupModal();

            modal.hidden = false;
            $(modal).css("display", "flex");
            $("body").addClass("schedule-popup-open");
        }
    }

    function focusSchedulePopup() {
        const modal = getSchedulePopupModal();
        const focusTarget = modal
            ? modal.querySelector("[data-schedule-popup-initial-focus]") ||
            modal.querySelector("button, [href], [tabindex]")
            : null;

        if (focusTarget) {
            focusTarget.focus({ preventScroll: true });
        }
    }

    function openSchedulePopup() {
        const modalWasMissing = !getSchedulePopupModal();
        let modal;

        if (modalWasMissing) {
            ensureSchedulePopupModal();
        }

        modal = getSchedulePopupModal();

        if (!modal) {
            return false;
        }

        if (isSchedulePopupVisible()) {
            resetSchedulePopupDialog();
            focusSchedulePopup();
            return true;
        }

        resetSchedulePopupDialog();
        schedulePopupLastFocusedElement =
            document.activeElement && document.activeElement !== document.body
                ? document.activeElement
                : null;
        modal.hidden = false;
        $(modal).css("display", "flex");
        $("body").addClass("schedule-popup-open");
        focusSchedulePopup();

        return true;
    }

    function closeSchedulePopup() {
        const modal = getSchedulePopupModal();

        if (!modal) {
            return;
        }

        resetSchedulePopupDialog();
        modal.hidden = true;
        $(modal).css("display", "");
        $("body").removeClass("schedule-popup-open");

        if (
            schedulePopupLastFocusedElement &&
            document.contains(schedulePopupLastFocusedElement)
        ) {
            schedulePopupLastFocusedElement.focus({ preventScroll: true });
        }

        schedulePopupLastFocusedElement = null;
    }

    function normalizeSchedulePopupName(popupName) {
        const aliases = {
            schedule: "schedule-popup",
            "schedule-popup": "schedule-popup",
            schedulePopup: "schedule-popup",
            schedule_popup: "schedule-popup",
            일정안내: "schedule-popup",
            "일정-안내": "schedule-popup",
        };
        const name = String(popupName || "").trim();

        return aliases[name] || "";
    }

    function getSchedulePopupNameFromQueryString() {
        const params = new URLSearchParams(window.location.search);
        const popupName =
            params.get("popup") ||
            params.get("modal") ||
            params.get("mainPopup") ||
            params.get("layer");

        if (popupName) {
            return popupName;
        }

        if (
            params.has("schedule") ||
            params.has("schedulePopup") ||
            params.has("schedule-popup")
        ) {
            return "schedule-popup";
        }

        return "";
    }

    function hasExplicitNonSchedulePopupQuery() {
        const params = new URLSearchParams(window.location.search);
        const popupName = getSchedulePopupNameFromQueryString();

        if (normalizeSchedulePopupName(popupName)) {
            return false;
        }

        return [
            "popup",
            "modal",
            "mainPopup",
            "layer",
            "tax",
            "taxFreeIncomeProof",
            "tax-free-income-proof",
            "industry",
            "smallBusinessExcludedIndustry",
            "small-business-excluded-industry",
            "excludedIndustry",
            "household",
            "householdProof",
            "household-proof",
            "householdIncludeExcludeProof",
            "household-include-exclude-proof",
            "income",
            "householdIncome",
            "household-income",
            "householdIncomeGuide",
            "household-income-guide",
        ].some(function (key) {
            return params.has(key);
        });
    }

    function shouldOpenSchedulePopupOnEntry() {
        const popupName = normalizeSchedulePopupName(
            getSchedulePopupNameFromQueryString(),
        );

        if (popupName === "schedule-popup") {
            return true;
        }

        return $("body").hasClass("main-page") && !hasExplicitNonSchedulePopupQuery();
    }

    window.openSchedulePopup = openSchedulePopup;
    window.closeSchedulePopup = closeSchedulePopup;

    /**
     * 상담 지원 모달을 공통 마크업으로 맞춘다.
     * 일부 HTML에 박혀 있는 이전 모달도 이 함수가 같은 구조로 교체한다.
     */
    function ensureCustomerModal() {
        const isVisible = $("#customer-modal").is(":visible");

        $("#customer-modal").remove();
        $("body").append(renderCustomerModal());

        if (isVisible) {
            $("#customer-modal").css("display", "flex");
        }
    }

    const footerBankGuideItems = [
        [
            "kb",
            "bank-logo-kb.png",
            "국민은행",
            "KB국민은행",
            "1588-9999",
            "https://www.kbstar.com/",
        ],
        [
            "ibk",
            "bank-logo-ibk.png",
            "기업은행",
            "IBK기업은행",
            "1588-2588",
            "https://www.ibk.co.kr",
        ],
        [
            "nh",
            "bank-logo-nh.png",
            "농협은행",
            "NH농협은행",
            "1661-3000",
            "https://banking.nonghyup.com",
        ],
        [
            "shinhan",
            "bank-logo-shinhan.png",
            "신한은행",
            "신한은행",
            "1599-8000",
            "https://www.shinhan.com",
        ],
        [
            "woori",
            "bank-logo-woori.png",
            "우리은행",
            "우리은행",
            "1588-5000",
            "https://www.wooribank.com",
        ],
        [
            "hana",
            "bank-logo-hana.png",
            "하나은행",
            "하나은행",
            "1599-1111",
            "https://www.kebhana.com",
        ],
        [
            "im",
            "bank-logo-im.png",
            "iM뱅크(구 대구은행)",
            "iM뱅크",
            "1588-5050",
            "https://www.imbank.co.kr",
        ],
        [
            "kn",
            "bank-logo-kn.png",
            "경남은행",
            "BNK경남은행",
            "1600-8585",
            "https://www.knbank.co.kr",
        ],
        [
            "busan",
            "bank-logo-busan.png",
            "부산은행",
            "BNK부산은행",
            "1588-6200",
            "https://www.busanbank.co.kr",
        ],
        [
            "gj",
            "bank-logo-gj.png",
            "광주은행",
            "광주은행",
            "1588-3388",
            "https://www.kjbank.com",
        ],
        [
            "jb",
            "bank-logo-jb.png",
            "전북은행",
            "전북은행",
            "1588-4477",
            "https://www.jbbank.co.kr",
        ],
        [
            "suhyup",
            "bank-logo-suhyup.png",
            "수협은행",
            "수협은행",
            "1588-1515",
            "https://www.suhyup-bank.com",
        ],
        [
            "kakao",
            "bank-logo-kakao.png",
            "카카오뱅크",
            "카카오뱅크",
            "1599-3333",
            "https://www.kakaobank.com",
        ],
        [
            "toss",
            "bank-logo-toss.png",
            "토스뱅크",
            "토스뱅크",
            "1661-7654",
            "https://www.tossbank.com",
        ],
        [
            "epost",
            "bank-logo-epost.png",
            "우정사업본부",
            "우정사업본부",
            "1599-1900",
            "https://www.epostbank.go.kr",
        ],
    ];

    function renderFooterBankGuideItem(item) {
        const bankKey = item[0];
        const fileName = item[1];
        const bankName = item[2];
        const bankLogoAlt = item[3];
        const phoneNumber = item[4];
        const homepageUrl = item[5];
        const telHref = "tel:" + phoneNumber.replace(/-/g, "");

        return [
            '<article class="product_guide_bank_item">',
            '    <span class="product_guide_bank_logo product_guide_bank_logo--' +
            bankKey +
            '">',
            '        <img src="../resources/images/yfs/main/banks/' +
            fileName +
            '" alt="' +
            bankLogoAlt +
            '" />',
            "    </span>",
            '    <strong class="product_guide_bank_name sr-only">' +
            bankName +
            "</strong>",
            '    <div class="product_guide_bank_actions">',
            '        <a class="product_guide_bank_action" href="' +
            telHref +
            '" aria-label="' +
            bankName +
            " 상담 전화 " +
            phoneNumber +
            '">',
            '            <img src="../resources/images/yfs/overview/v2/icon-headset.svg" alt="" />',
            "        </a>",
            '        <a class="product_guide_bank_action" href="' +
            homepageUrl +
            '" target="_blank" rel="noopener noreferrer" aria-label="' +
            bankName +
            ' 홈페이지 새 창 열기">',
            '            <img src="../resources/images/yfs/overview/v2/icon-home.svg" alt="" />',
            "        </a>",
            "    </div>",
            "</article>",
        ].join("");
    }

    /** fallback 취급 은행 안내 panel id 중복을 막기 위한 순번입니다. */
    let footerBankGuideSequence = 0;

    /**
     * 정적 마크업이 아직 없는 기존 페이지를 위한 취급 은행 안내 fallback HTML을 만든다.
     * 새로 수정하는 페이지는 footer/support HTML 안에 직접 작성하는 것을 우선한다.
     *
     * @returns {string} 취급 은행 안내 HTML 문자열입니다.
     */
    function renderFooterBankGuide() {
        footerBankGuideSequence += 1;

        const panelId = "site-footer-bank-panel-" + footerBankGuideSequence;

        return [
            '<div class="site-footer__bank">',
            '    <button class="quick-action-item site-footer__bank-toggle" type="button" aria-expanded="false" aria-controls="' +
            panelId +
            '">',
            '        <span class="action-label">취급 은행 안내</span>',
            '        <img class="action-arrow site-footer__bank-toggle-icon" src="../resources/images/yfs/common/footer_bank_toggle_icon.svg" alt="" />',
            "    </button>",
            '    <div id="' +
            panelId +
            '" class="site-footer__bank-panel" hidden>',
            '        <div class="product_guide_bank_cards">',
            footerBankGuideItems.map(renderFooterBankGuideItem).join(""),
            "        </div>",
            "    </div>",
            "</div>",
        ].join("");
    }

    function ensureFooterBankGuide() {
        $(".site-footer").each(function () {
            const $footer = $(this);
            const $support = $footer.find(".site-footer__support").last();
            const $meta = $footer.find(".site-footer__meta").first();

            if ($footer.find(".site-footer__bank").length) {
                return;
            }

            if ($support.length) {
                $support.append(renderFooterBankGuide());
            } else if ($meta.length) {
                $meta.before(renderFooterBankGuide());
            }
        });
    }

    function ensureMainSupportBankGuide() {
        $(
            ".main-page .main-support-tablet, .page-fragment--review .main-support-tablet",
        ).each(function () {
            const $support = $(this);
            const $actions = $support.find(".quick-action-bar").first();
            const $warning = $support
                .find(".product_guide_warning_notice")
                .first();

            if ($support.find(".site-footer__bank").length) {
                return;
            }

            if ($actions.length) {
                $actions.append(renderFooterBankGuide());
            } else if ($warning.length) {
                $warning.before(renderFooterBankGuide());
            } else {
                $support.append(renderFooterBankGuide());
            }
        });
    }

    /**
     * HTML에 배치된 취급 은행 안내의 접힘/펼침 상태만 제어한다.
     * DOM 생성은 하지 않고 wrapper class, aria-expanded, panel hidden 값만 동기화한다.
     *
     * @returns {void}
     */
    function setupFooterBankGuideToggle() {
        $("button.site-footer__bank-toggle").each(function (_, element) {
            const button = element;
            const panelId = button.getAttribute("aria-controls");
            const panel = panelId ? document.getElementById(panelId) : null;
            const bankGuide = button.closest(".site-footer__bank");
            const isExpanded = button.getAttribute("aria-expanded") === "true";

            if (!panel || !bankGuide) {
                return;
            }

            panel.hidden = !isExpanded;
            bankGuide.classList.toggle("is-open", isExpanded);
        });

        $(document).on(
            "click",
            "button.site-footer__bank-toggle",
            function (event) {
                const button = event.currentTarget;
                const panelId = button.getAttribute("aria-controls");
                const panel = panelId ? document.getElementById(panelId) : null;
                const bankGuide = button.closest(".site-footer__bank");

                if (!panel || !bankGuide) {
                    return;
                }

                const isExpanded =
                    button.getAttribute("aria-expanded") === "true";

                button.setAttribute("aria-expanded", String(!isExpanded));
                panel.hidden = isExpanded;
                bankGuide.classList.toggle("is-open", !isExpanded);
            },
        );
    }

    function getHeaderQuickMenu(toggle) {
        const menuId = toggle.getAttribute("aria-controls");

        return menuId ? document.getElementById(menuId) : null;
    }

    function setHeaderQuickMenuOpen(toggle, isOpen) {
        const menu = getHeaderQuickMenu(toggle);
        const header = toggle.closest(".site-header");

        if (!menu || !header) {
            return;
        }

        header.classList.toggle("site-header--menu-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute(
            "aria-label",
            isOpen
                ? "청년 금융 바로가기 메뉴 닫기"
                : "청년 금융 바로가기 메뉴 열기",
        );
        menu.hidden = !isOpen;
    }

    function closeHeaderQuickMenus(exceptToggle) {
        $("[data-header-menu-trigger]").each(function (_, element) {
            if (exceptToggle && element === exceptToggle) {
                return;
            }

            setHeaderQuickMenuOpen(element, false);
        });
    }

    function setupHeaderQuickMenu() {
        closeHeaderQuickMenus();

        $(document).on("click", "[data-header-menu-trigger]", function (event) {
            event.preventDefault();

            const toggle = event.currentTarget;
            const isOpen = toggle.getAttribute("aria-expanded") === "true";

            closeHeaderQuickMenus(toggle);
            setHeaderQuickMenuOpen(toggle, !isOpen);
        });

        $(document).on("click", function (event) {
            if (
                $(event.target).closest(
                    ".header-quick-menu, [data-header-menu-trigger]",
                ).length
            ) {
                return;
            }

            closeHeaderQuickMenus();
        });

        $(document).on("keydown", function (event) {
            if (event.key !== "Escape") {
                return;
            }

            const openToggle = $("[data-header-menu-trigger]")
                .filter(function (_, element) {
                    return element.getAttribute("aria-expanded") === "true";
                })
                .first();

            if (!openToggle.length) {
                return;
            }

            const toggle = openToggle[0];
            setHeaderQuickMenuOpen(toggle, false);
            toggle.focus();
        });
    }

    $(function () {
        ensureFooterBankGuide();
        ensureMainSupportBankGuide();
        setupFooterBankGuideToggle();
        initAllFooterPromoSliders();

        if ($("[data-customer-modal-trigger]").length) {
            ensureCustomerModal();
        }

        if (
            $("[data-review-calendar-trigger], [data-schedule-popup-trigger]")
                .length ||
            shouldOpenSchedulePopupOnEntry()
        ) {
            ensureSchedulePopupModal();
            $(
                "[data-review-calendar-trigger], [data-schedule-popup-trigger]",
            ).attr({
                "aria-label": "일정 안내 팝업 열기",
                "aria-controls": "schedule-popup-modal",
                "aria-haspopup": "dialog",
            });
        }

        $("#divLayerPopConfirm").on("click", closeLayerPop);
        $("#divLayerPopXConfirm").on("click", closeLayerPopXWithCallback);
        $("#divLayerPopXClose").on("click", closeLayerPopXWithoutCallback);
        $("#divTitleLayerPopConfirm").on("click", function () {
            const callback = titleLayerPopCallback;

            $("#divTitleLayerPop").hide();
            syncLayerPopPageState(false);
            titleLayerPopCallback = null;

            if (typeof callback === "function") {
                callback();
            }
        });
        $("#divLayerConfirmYes").on("click", function () {
            if (typeof layerConfirmYesCallback === "function") {
                layerConfirmYesCallback();
            }
        });
        $("#divLayerConfirmNo").on("click", function () {
            if (typeof layerConfirmNoCallback === "function") {
                layerConfirmNoCallback();
            }
        });

        // 공통 바텀시트 모달: data-attribute 로 어느 페이지에서든 트리거/닫기
        $(document).on("click", "[data-customer-modal-trigger]", function (e) {
            // 오픈 전 막기
            const curDatetime = new Date();
            const blockDatetime = new Date("2026-06-22T09:00");

            if (Number(curDatetime) <= Number(blockDatetime)) {
                $("#customer-modal").hide();
                showLayerPop('청년미래적금 출시 후 이용 가능합니다.')
                return;
            }

            e.preventDefault();
            ensureCustomerModal();
            $("#customer-modal").css("display", "flex");
        });
        $(document).on("click", "[data-customer-modal-close]", function () {
            $("#customer-modal").hide();
        });
        $(document).on("keydown", function (e) {
            if (e.key === "Escape" && $("#customer-modal").is(":visible")) {
                $("#customer-modal").hide();
            }
        });

        $(document).on(
            "click",
            "[data-review-calendar-trigger], [data-schedule-popup-trigger]",
            function (e) {
                e.preventDefault();
                openSchedulePopup();
            },
        );
        $(document).on("click", "[data-schedule-popup-close]", function (e) {
            e.preventDefault();
            closeSchedulePopup();
        });
        $(document).on("keydown", function (e) {
            if (e.key === "Escape" && isSchedulePopupVisible()) {
                closeSchedulePopup();
            }
        });

        if (shouldOpenSchedulePopupOnEntry()) {
            openSchedulePopup();
        }



        // 바텀시트 핸들 드래그-투-클로즈 (공통)
        // - .modal_handle_wrapper → .modal_sheet / .modal_sheet_full → .modal_overlay
        // - .customer-modal__handle-area → .customer-modal__sheet → .customer-modal
        const DRAG_CLOSE_THRESHOLD = 80;
        const DRAG_HANDLE_SELECTOR =
            ".modal_handle_wrapper, .customer-modal__handle-area, .schedule-popup-modal__handle-area";
        const DRAG_SHEET_SELECTOR =
            ".modal_sheet, .modal_sheet_full, .customer-modal__sheet, .schedule-popup-modal__dialog";
        const DRAG_OVERLAY_SELECTOR =
            ".modal_overlay, .customer-modal, .schedule-popup-modal";
        let dragStartY = 0;
        let dragDeltaY = 0;
        let isDragging = false;
        let dragSheet = null;
        let dragOverlay = null;

        function onDragStart(e) {
            const handle = e.currentTarget;
            const sheet = handle.closest(DRAG_SHEET_SELECTOR);
            const overlay = handle.closest(DRAG_OVERLAY_SELECTOR);
            if (!sheet || !overlay) return;
            isDragging = true;
            dragSheet = sheet;
            dragOverlay = overlay;
            dragStartY = e.touches ? e.touches[0].clientY : e.clientY;
            dragDeltaY = 0;
            sheet.classList.add("is-dragging");
        }

        function onDragMove(e) {
            if (!isDragging || !dragSheet) return;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            dragDeltaY = Math.max(0, y - dragStartY);
            dragSheet.style.transform =
                "translateY(" + dragDeltaY + "px)";
        }

        function onDragEnd() {
            if (!isDragging || !dragSheet) return;
            const sheet = dragSheet;
            const overlay = dragOverlay;
            const shouldClose = dragDeltaY > DRAG_CLOSE_THRESHOLD;
            isDragging = false;
            dragSheet = null;
            dragOverlay = null;
            sheet.classList.remove("is-dragging");

            if (shouldClose) {
                sheet.classList.add("is-closing");
                window.setTimeout(function () {
                    if (overlay && overlay.id === "schedule-popup-modal") {
                        closeSchedulePopup();
                    } else {
                        $(overlay).hide();
                    }
                    sheet.classList.remove("is-closing");
                    sheet.style.transform = "";
                }, 200);
            } else {
                sheet.style.transform = "";
            }
        }

        $(document).on(
            "touchstart mousedown",
            DRAG_HANDLE_SELECTOR,
            onDragStart
        );
        $(document).on("touchmove mousemove", onDragMove);
        $(document).on("touchend touchcancel mouseup", onDragEnd);
    });
})();
