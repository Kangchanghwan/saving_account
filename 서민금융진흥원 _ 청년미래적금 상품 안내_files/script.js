  $(document).ready(function () {
  //datepicker
  $(".datepicker")
    .datepicker({
      changeMonth: true,
      changeYear: true,
      dateFormat: "yy.mm.dd",
    })
    .attr("autocomplete", "off");

  //select
  $(function () {
    var selectTarget = $("select");

    selectTarget
      .on("click", function () {
        $(this).closest(".selectbox").toggleClass("active");

        var select_name = $(this).children("option:selected").text();
        $(this).siblings("label").text(select_name);
      })
      .on("blur", function () {
        $(this).closest(".selectbox").removeClass("active");
      });
  });

  //input
  $("input[type='text'], input[type='password'], input[type='number']").on(
    "blur",
    function () {
      if ($(this).val().length) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
    }
  );
  $(".x_btn").on("click", function () {
    $(this).siblings("input").val("");
  });

  //checkbox radio function
  $('.one_check input[type="checkbox"]').on("click", function () {
    var chk = $(this);

    if (chk.prop("checked")) {
      $(chk)
        .closest(".one_check")
        .find('input[type="checkbox"]')
        .prop("checked", false);

      chk.prop("checked", true);
    }
  });
  //add file
  $(".file_btn").on("change", function () {
    var fileName = $(this).find("input").val();
    var addChild =
      '<li class="under_line">' + fileName + '<span class="x_btn">' + "</li>";
    $(this).siblings(".file_list").append(addChild);
  });

  $(document).on("click", ".file_list .x_btn", function () {
    $(this).closest("li").remove();
  });

  //popup
  $(".btn").on("click", function () {
    var $id = $(this).prop("id");
    var $idopen = $id + "_open";
    $("#" + $idopen + "")
      .addClass("display_block")
	  .attr('tabindex','0').focus()
      .after('<div class="dim"></div>')
      .show();
  });
  $(".popup .pop_title .x_btn").on("click", function () {
    $(this).closest(".popup")
	.removeClass("display_block")
	.removeAttr('tabindex');
    $(".dim").hide();
  });
  $(".popup").on(function () {
	$(".pop_title").attr("tabindex","0").show().focus();
	$this = $(this);
  });	

  //quick menu
  $(".menu_img").on("click", function () {
    $(".ftion").toggleClass("hide");
    $(this).toggleClass("active");
  });

  //toggle event
  $(".toggle_wrap > li p").on("click", function () {
    $(this).siblings(".tg_ul").slideToggle(500);
    $(this).closest("button").aria-expanded("true");
  });

 // $(".toggle_wrap > .accordion > button").on("click", function () {
  //  $(this).siblings(".tg_ul").slideToggle(500);
 //   $(this).closest("li").toggleClass("active");	
 // });

  //max height
  $(".list05 li").each(function () {
    if ($(this).find("div.file_wrap").length > 1) {
      $(this).css({ border: "0" }).siblings("li").css("border", "0");
      $(this).find(".list_c").css({ border: "0" });
      $(this).closest(".list05").css({ borderBottom: "1px solid #d5d5d5" });
    }
  });

  $('.agree_wrap input[type="checkbox"]').on("click", function () {
    var chk = $(this);

    if (chk.prop("checked")) {
      $(chk)
        .closest("div")
        .find('input[type="checkbox"]')
        .prop("checked", false);

      chk.prop("checked", true);
    }
  });
  /* 230920 추가 */
 //$(".certi_first button").on("click", function () {
   // $(".certi_first").addClass("display_none");	
//$(".certi_second").removeClass("display_none");
//	$(".t_only").removeClass("certi_subMain");
 // });

// 1129 웹접근성 수정
$(".certi_first button").on("click", function () {
    $(".certi_first .service_ul button").addClass("active");
    $(".certi_first .service_ul button").removeClass("active");
    $(".certi_first .service_ul").removeClass("on");
    $(this).addClass("active");
	$(".certi_first .service_ul button").attr('aria-current','false');
	$(".certi_first .service_ul button.active").attr('aria-current','true');

    var inx = $(this).index();
    if (inx == 0) {
      $(this).closest(".certi_first .service_ul").addClass("on");
    }
    if (inx == 1) {
      $(this).closest(".certi_first .service_ul").addClass("on");     
    }
  });

$(".certi_second button").on("click", function () {
	$(".certi_second .service_ul button").addClass("active");
    $(".certi_second .service_ul button").removeClass("active");
    $(".certi_second .service_ul").removeClass("on");
    $(this).addClass("active");
	$(".certi_second .service_ul button").attr('aria-current','false');
	$(".certi_second .service_ul button.active").attr('aria-current','true');
});
// 1129 웹접근성 수정 end

  /* 소스전달시 주석 처리해야함!  공동인증서 클릭이벤트*/
  $(".certi_ul button").on("click", function () {
    $(".certi_ul .service_ul button").removeClass("active");
    $(".certi_ul .service_ul").removeClass("on");
    $(this).addClass("active");

    var inx = $(this).index();
    if (inx == 0) {
      $("section:last-child").removeClass("t_only");
      $(this).closest(".certi_ul .service_ul").addClass("on");
      $(".tab_1").removeClass("display_none");
      $(".tab_2only").addClass("display_none");
	  $(".tab_info").removeClass("display_none");
    }
    if (inx == 1) {
      $("section:last-child").removeClass("t_only");
      $(this).closest(".certi_ul .service_ul").addClass("on");
      $(".tab_1").addClass("display_none");
      $(".tab_2only").removeClass("display_none");
	  $(".tab_info").addClass("display_none");
    }
//230915 추가
    if (inx == 2) {
      $("section:last-child").removeClass("t_only");
      $(this).closest(".certi_ul .service_ul").addClass("on");
      $(".tab_1").addClass("display_none");
      $(".tab_2only").removeClass("display_none");
      $(".tab_info").removeClass("display_none");
    }
  });
 /* 소스전달시 주석 처리해야함! */
 
  if ($(".tab_2only").css("display") == "none") {
    $(".tab2_input").css({ width: "100%" });
  }

  $('.service_agree_wrap .radiocss input[type="radio"]').on(
    "click",
    function () {
      var inx = $(this).index();
      if (inx == 2) {
        $(".service_agree_wrap").addClass("on");
      } else {
        $(".service_agree_wrap").removeClass("on");
      }
    }
  );

  //가구원최신화 kinfa_w_01
  $(".updateTab_next").click(function () {
  	$(".updateTab02").show();
	$(".updateTab01").css("display","none");
  });
  $(".updateTab_prev").click(function () {
  	$(".updateTab01").show();
	$(".updateTab02").css("display","none");
  });
	
  //이벤트팝업
  $(".next_btn").on("click", function () {
    $(this)
      .siblings(".pop_con")
      .find(".list01 li:first-child")
      .toggleClass("display_none");
    $(this)
      .siblings(".pop_con")
      .find(".list01 li:last-child")
      .toggleClass("display_none");

    $(this)
      .find(".btn:nth-child(3)")
      .on("click", function () {
        $(this).closest(".popup").addClass("display_none");
        $(".dim").hide();
      });
    // click btn
    $(this).find(".btn:nth-child(1)").toggleClass("display_none");
    $(this).find(".btn:nth-child(2)").toggleClass("display_none");
    $(this).find(".btn:nth-child(3)").toggleClass("display_none");
  });

//웹접근성  modal 1129 웹접근성 수정

//accordion
	
	'use strict';
	
	class Accordion {
		constructor(domNode) {
			this.rootEl = domNode;
			this.buttonEl =	this.rootEl.querySelector('button[aria-expanded]');
			
			const controlsId = this.buttonEl.getAttribute('aria-controls');
			this.contentEl = document.getElementById(controlsId);
			
			this.open = this.buttonEl.getAttribute('aria-expanded') === 'true';
			
			this.buttonEl.addEventListener('click', this.onButtonClick.bind(this));
		}
		
		onButtonClick() {
			this.toggle(!this.open);
		}
		
		toggle(open) {
			if (open === this.open) {
				return;
			}
			
			this.open = open;
			
			this.buttonEl.setAttribute('aria-expanded', `${open}`);
			if (open) {
				this.contentEl.removeAttribute('hidden');
			} else {
				this.contentEl.setAttribute('hidden','');
			}
		}
		
		open() {
			this.toggle(true);
		}
		
		close() {
			this.toggle(false);
		}
	}
	
	const accordions = document.querySelectorAll('.accordion h3');
	accordions.forEach((accordionEl) => {
		new Accordion(accordionEl);
	});
	
	
	const closes = document.querySelectorAll('.modal-hide');
	
	Array.from(closes).forEach((c) => {
		c.addEventListener('click', (event) => {
			const dialog = event.currentTarget.parentElement.parentElement.parentElement.parentElement;
			dialog.style.display = "none";
		})
    });

	
// 1129 웹접근성 수정 end	
	
});
