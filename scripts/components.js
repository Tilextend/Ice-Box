/*状态*/

//初始化：
var touchCompatibility = ("ontouchstart" in document.documentElement);
var hoverElements, focusElements, selectedElements, activedElements, pressedElements, draggedElements;

$(hoverElements + ',' + focusElements + ',' + selectedElements + ',' + activedElements + ',' + draggedElements).prepend('<div class="states"></div>');
$(hoverElements).find('.states').append('<div class="hover"></div>');
$(focusElements).find('.states').append('<div class="focus"></div>');

$(pressedElements).prepend('<div class="ripples"></div>');
$(pressedElements).children('.ripples').prepend('<div class="ripple-background"></div>');


//鼠标悬浮：
if (!touchCompatibility) {
    $(hoverElements).hover(
        function () {
            $(this).children('.states').children('.hover').addClass("on");
        }, function () {
            $(this).children('.states').children('.hover').removeClass("on");
        }
    );
}

//聚焦：
let focusBefore = true;

$(focusElements).hover(
    function () {
        if ($(this).is(':focus')) {
            focusBefore = true;
        } else {
            focusBefore = false;
        }
    }, function () {
        focusBefore = true;
    }
);

$(focusElements).on("focus", function () {
    if (focusBefore == false) {
        $(this).blur();
    } else {
        $(this).children('.states').children('.focus').addClass("on");
    }
});

$(focusElements).on("blur", function () {
    $(this).children('.states').children('.focus').removeClass("on");
});


//涟漪：
let rippleBackgroundFullOn = false;
let rippleTouchStart = false;

$(pressedElements).on("touchstart", function (rippleTouchEvent) {
    rippleTouchStart = true;
    rippleBackgroundFullOn = false;

    rippleForeground($(this), rippleTouchEvent);
    rippleBackground($(this));
});

$(pressedElements).on("keydown", function (rippleKeyboardEvent) {
    if (rippleKeyboardEvent.key !== " " && rippleKeyboardEvent.key !== "Enter") {
        return;
    }

    rippleForeground($(this), rippleKeyboardEvent);
});

$(pressedElements).on("mousedown", function (rippleMouseEvent) {
    if (rippleMouseEvent.button !== 0 || rippleTouchStart == true) {
        return;
    }

    rippleForeground($(this), rippleMouseEvent);
});

function rippleForeground(parentElement, rippleInputEvent) {
    containerWidth = parentElement.innerWidth();
    containerHeight = parentElement.innerHeight();
    containerLeft = parentElement.offset().left;
    containerTop = parentElement.offset().top;

    parentElement.children('.ripples').css({
        "--ripple-diameter": Math.hypot(containerWidth, containerHeight) + "px"
    });

    parentElement.children('.ripples').append('<div class="ripple-foreground"></div>');

    if (rippleInputEvent.type == "mousedown") {
        inputLeft = rippleInputEvent.pageX;
        inputTop = rippleInputEvent.pageY;
    }
    if (rippleInputEvent.type == "touchstart") {
        inputLeft = rippleInputEvent.changedTouches[0].pageX;
        inputTop = rippleInputEvent.changedTouches[0].pageY;
    }
    if (rippleInputEvent.type == "mousedown" || rippleInputEvent.type == "touchstart") {
        rippleOriginLeft = Math.abs(containerLeft - inputLeft);
        rippleOriginTop = Math.abs(containerTop - inputTop);
        parentElement.find(".ripple-foreground:last").first().css({
            "--targets-center-offset-x": containerWidth / 2 - rippleOriginLeft + "px",
            "--targets-center-offset-y": containerHeight / 2 - rippleOriginTop + "px",
            "--ripple-origin-left": rippleOriginLeft + "px",
            "--ripple-origin-top": rippleOriginTop + "px"
        });
    }

    requestAnimationFrame(function () {
        parentElement.find(".ripple-foreground:last").first().addClass('on');
        parentElement.find(".ripple-foreground:last").first().one('animationend', function () {
            $(this).remove();
        });
    });
}

function rippleBackground(parentElement) {
    parentElement.find(".ripple-background").first().addClass('on');
    parentElement.find(".ripple-background").first().one('transitionend', function () {
        rippleBackgroundFullOn = true;
    });
    parentElement.one("touchend", function () {
        if (rippleBackgroundFullOn == true) {
            $(this).find(".ripple-background").first().removeClass('on');
        } else {
            $(this).one('transitionend', function () {
                $(this).find(".ripple-background").first().removeClass('on');
            });
        }
    });
}

/*控件*/

var actionEnable = true;

$('.check-box').on("click", function () {
    if (actionEnable == false) { return }
    actionEnable = false;
    
    if ($(this).hasClass('checked')) {
        $(this).removeClass('to-checked');
        $(this).addClass('unchecked');
        $(this).removeClass('checked');
        $(this).addClass('to-unchecked');
        count = 0;
        $(this).on('animationend', function () {
            count++
            if (count == 2) {
                $(this).off('animationend');
                actionEnable = true;
            }
        });
    } else {
        $(this).removeClass('to-unchecked');
        $(this).addClass('checked');
        $(this).removeClass('unchecked');
        $(this).addClass('to-checked');
        count = 0;
        $(this).on('animationend', function () {
            count++
            if (count == 2) {
                $(this).off('animationend');
                actionEnable = true;
            }
        });
    }
});

$('.radio-button').on("click", function () {
    if (actionEnable == false) { return }
    actionEnable = false;
    
    if ($(this).hasClass('checked') == false) {
        listElement.find('.radio-button').removeClass('to-unchecked to-checked');
        listElement.find('.radio-button').filter('.checked').addClass('unchecked to-unchecked').removeClass('checked');
        $(this).addClass('checked');
        $(this).removeClass('unchecked');
        $(this).addClass('to-checked');
        count = 0;
        $(this).on('animationend', function () {
            count++
            if (count == 2) {
                $(this).off('animationend');
                actionEnable = true;
            }
        });
    } else {
        actionEnable = true;
    }
});

/*菜单*/

function openMenu(menuElement) {
    if (actionEnable == false) { return }
    actionEnable = false;

    menuElement.addClass('on enter');

    count = 0;
    menuElement.find('.menu').on('animationend', function () {
        count++
        if (count == 2) {
            $(this).off('animationend');
            menuElement.addClass('stable');
            menuElement.removeClass('enter');
            actionEnable = true;
        }
    });
}

function closeMenu(menuElement) {
    menuElement.addClass('exit');
    menuElement.one('animationend', function () {
        menuElement.removeClass('on stable exit');
        actionEnable = true;
    });
}

$('.menu-wrapper').on("click", function (event) {
    if (event.target !== event.currentTarget) { return }
    if (actionEnable == false) { return }
    actionEnable = false;

    closeMenu($(this));
});

let snackbarTimer;

function openSnackbar(snackbarElement, duration) {
    clearTimeout(snackbarTimer);
    if (duration == null) {
        duration = 2750;
    }
    snackbarElement.addClass('on enter');
    snackbarTimer = setTimeout(function () {
        snackbarElement.removeClass('enter');
        snackbarElement.one('transitionend', function () {
            $(this).removeClass('on');
        });
    }, duration + 250)
}