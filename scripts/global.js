
let keyline = 16;
let increment = 56;
let simulatorWidth = 360;

/*模拟器*/

function reCalculateProperty() {
    controlPanelHeight = $('#freeze-selected').filter(".on").not('.exit').length * (32 + keyline) + $('.selection-action').not('.exit, #freeze-selected').filter(".on").length * (24 + keyline) + 2 * increment + 16;
    $('#ice-box').css({
        "--sheet-height": $('#ice-box .sheet').height() + "px",
        "--control-panel-height": controlPanelHeight + "px"
    });
}

function reStyle() {
    if (iceBoxOpenStatus >= 2 && iceBoxOpenStatus < 3) {
        if (simulatorWidth == 1024) {
            $('.system-bars .status-bar').removeClass('dark');
        } else {
            $('.system-bars .status-bar').addClass('dark');
        }
    }
}

$('.simulator-width-controller > div').on("click", function () {
    if ($(this).is('.dp360')) {
        simulatorWidth = 360;
        keyline = 16;
        increment = 56;
    }
    if ($(this).is('.dp600')) {
        simulatorWidth = 600;
        keyline = 24;
        increment = 64;
    }
    if ($(this).is('.dp1024')) {
        simulatorWidth = 1024;
        keyline = 24;
        increment = 64;
    }

    if ($(this).not('.on')) {
        $('.simulator').attr("data-simulator-width", simulatorWidth);
        reCalculateProperty();
        reStyle();
    }

    $(this).addClass('on');
    $('.simulator-width-controller > div').not(this).removeClass('on');
});



/*系统*/

$('.navigation-bar i').on("mousedown touchstart", function (navRippleEvent) {
    if (navRippleEvent.button !== 0) { return }
    $('.navigation-bar-ripples').append('<div class="ripple"></div>');
    $('.navigation-bar-ripples .ripple:last').css({
        "--navigation-bar-key-left": $(this).position().left + "px",
        "--navigation-bar-ripple-width": $('.navigation-bar-ripples .ripple:last').width() + "px"
    });
    requestAnimationFrame(function () {
        $('.navigation-bar-ripples .ripple:last').addClass('on');
        $('.navigation-bar-ripples .ripple').one('transitionend', function () {
            $(this).remove();
        });
    });
});



/*网页加载*/

hoverElements = ".button, .selection-action, .icon-button, .settings .list";
focusElements = ".button, .selection-action, .icon-button, .settings .list";
pressedElements = ".button, .page button, .selection-action, .icon-button, .settings .list";

window.onload = function () {
    $('.simulator').addClass("on");
};


/*冰箱*/

let iceBoxOpenStatus = 0;

function getRevealRadius(originElement, parentElement) {

    parentElementLeftBorder = parentElement.offset().left;
    parentElementRightBorder = parentElement.offset().left + parentElement.innerWidth();
    parentElementTopBorder = parentElement.offset().top;
    parentElementBottomBorder = parentElement.offset().top + parentElement.innerHeight();
    originElementLeftPoint = originElement.offset().left + originElement.innerWidth() / 2;
    originElementTopPoint = originElement.offset().top + originElement.innerHeight() / 2;
    leftOffset = Math.abs(originElementLeftPoint - parentElementLeftBorder);
    rightOffset = Math.abs(originElementLeftPoint - parentElementRightBorder);
    topOffset = Math.abs(originElementTopPoint - parentElementTopBorder);
    bottomOffset = Math.abs(originElementTopPoint - parentElementBottomBorder);

    maxRadius = Math.max(Math.hypot(leftOffset, topOffset), Math.hypot(rightOffset, topOffset), Math.hypot(leftOffset, bottomOffset), Math.hypot(rightOffset, bottomOffset));
    return maxRadius;
}

$('.launcher-app img').on("click", function () {
    if (actionEnable == false) { return }
    actionEnable = false;

    $('#ice-box').css("--sheet-height", $('#ice-box .sheet').height() + "px");
    $(this).addClass('on');
    $(this).one('transitionend', function () {
        $(this).removeClass('on');
    });
    $('#ice-box').addClass('on custom-enter');
    $('#ice-box .sheet').one('animationend', function () {
        $('#ice-box').addClass('stable');
        $('#ice-box').removeClass('custom-enter');
        actionEnable = true;
    });
    iceBoxOpenStatus = 1;
});

$('#edit, #settings').on("click", function () {
    if (actionEnable == false) { return }
    actionEnable = false;

    pressedButton = $(this);
    $('#ice-box').css("--sheet-height", $('#ice-box .sheet').height() + "px");
    if (pressedButton.is('#edit')) {
        $('#ice-box').addClass('onedit');
        $('.edit-list').addClass('on enter');
    } else {
        $('#ice-box').addClass('onsettings');
        $('.settings').addClass('on enter');
    }
    $('#ice-box').css("--secondary-action-reveal-radius", getRevealRadius(pressedButton, $('.secondary-actions')) + "px");
    $('.secondary-actions').addClass('on enter');
    if (simulatorWidth < 700) {
        $('.system-bars .status-bar').addClass('dark darken');
    }

    $('.secondary-actions .app-bar').one('animationend', function () {
        $('.secondary-actions, .secondary-actions .on').addClass('stable');
        $('.secondary-actions, .secondary-actions .on').removeClass('enter');
        $('.system-bars .status-bar').removeClass('darken');
        $('#ice-box').css("--secondary-action-reveal-radius", getRevealRadius($('#frozen-all'), $('.secondary-actions')) + "px");
        actionEnable = true;
        iceBoxOpenStatus = 2;
    });
});

$('.edit-list .lists .check-box').on("click", function () {
    pressedItemID = $(this).parent().attr('data-app-id');
    pressedItemIcon = $(this).parent().find('img').attr("src");
    pressedItemName = $(this).parent().find('span')[0].childNodes[0].nodeValue;

    if ($(this).is('.checked')) {
        $(this).parent().removeClass('freeze');
        $('#ice-box .page').find("[data-app-id='" + pressedItemID + "']").remove();
    } else {
        $(this).parent().addClass('freeze');
        $("#ice-box .sheet .page:last").append('<button class="unbounded freeze"><img><span class="caption"></span><i class="material-icons">check_circle</i></button>');
        $("#ice-box .sheet .page:last button:last img").attr('src', pressedItemIcon);
        $("#ice-box .sheet .page:last button:last span").text(pressedItemName);
    }
});

$('#list-filter').on("click", function () {
    openMenu($('#filter-menu'));
    iceBoxOpenStatus = 2.4;
});

$('.menu-wrapper').on("click", function () {
    iceBoxOpenStatus = 2;
});

$('.radio-button').on("click", function () {
    listElement = $('#filter-menu');
});

let longpress = 500;
let start;
let timer;
let pressedItem;
let pressStatus = 0;
let controlPanelHeight;
let selectedItemsSum = 0;
let pressedFreezeItemsSum = 0;

function getPressedItemInfo(trigger) {
    pressedItem = trigger;
    pressedItemID = pressedItem.attr('data-app-id');
    pressedItemName = pressedItem.find('span').text();
    pressedItemIcon = pressedItem.find('img').attr("src");
    pressedItemTop = pressedItem.offset().top - $('#ice-box').offset().top;
    pressedItemLeft = pressedItem.offset().left - $('#ice-box').offset().left;
}

function openControlPanel() {
    if (pressedItem.hasClass('freeze')) {
        $('#defrost-selected').addClass('on');
    } else {
        $('#freeze-selected').addClass('on');
    }

    controlPanelHeight = $('.control-panel').innerHeight();
    $('#ice-box').css("--control-panel-height", controlPanelHeight + "px");

    $('#ice-box').addClass('control-panel-enter');
    $('.control-panel').addClass('on enter');
    $('.control-panel').one('animationend', function () {
        $('#ice-box').addClass('onselect');
        $('.control-panel').addClass('stable');
        $('#ice-box').removeClass('control-panel-enter');
        $('.control-panel').removeClass('enter');
        iceBoxOpenStatus = iceBoxOpenStatus + 0.2;
        actionEnable = true;
    });
}

function controlPanelActionsSwitch() {
    pressedFreezeItemsSum = $('#ice-box .page .selected').filter(".freeze").length;
    if (pressedFreezeItemsSum == 0) {
        $('#defrost-selected').filter(".on").addClass('exit');
        $('#freeze-selected').not('.on').addClass('on enter');
    } else {
        if (pressedFreezeItemsSum == selectedItemsSum) {
            $('#defrost-selected').not('.on').addClass('on enter');
            $('#freeze-selected').filter(".on").addClass('exit');
        } else {
            $('#defrost-selected').not('.on').addClass('on enter');
            $('#freeze-selected').not('.on').addClass('on enter');
        }
    }

    controlPanelHeight = $('#freeze-selected').filter(".on").not('.exit').length * (32 + keyline) + $('.selection-action').not('.exit, #freeze-selected').filter(".on").length * (24 + keyline) + 2 * increment + 16;
    $('#ice-box').css("--control-panel-height", controlPanelHeight + "px");

    $('.selection-action').filter(".enter, .exit").one('animationend', function () {
        $('.selection-action').filter(".exit").removeClass('on');
        $(this).removeClass('enter exit');
        actionEnable = true;
    });
}

function controlPanelAppAdd() {
    $('.selection-folder').append('<img></img>');
    $('.selection-folder img:last').addClass(pressedItemID);
    $('.selection-folder img:last').attr('src', pressedItemIcon);
    if (selectedItemsSum > 1) {
        $('.selection-folder img:last').addClass('enter');
        $('.selection-folder .enter').one('animationend', function () {
            $(this).removeClass('enter');
            actionEnable = true;
        });
    }
    $('.selection-counter').before('<span>' + pressedItemName + '</span>');
    $('.selection-counter').prev().addClass(pressedItemID);
}

function controlPanelAppRemove() {
    if ($('.selection-folder').find('.' + pressedItemID).index() <= (selectedItemsSum - 2)) {
        $('.selection-folder').find('.' + pressedItemID).remove();
    } else {
        $('.selection-folder').addClass('item-exit');
        folderExitItemIndexParameter = $('.selection-folder').find('.' + pressedItemID).css("--folder-stack-icon-index-parameter");
        $('.selection-folder').find('.' + pressedItemID).wrap("<div class='exit'></div>");
        $('.selection-folder .exit').css("--folder-stack-icon-index-parameter", folderExitItemIndexParameter);
        $('.selection-folder .exit').one('animationend', function () {
            $('.selection-folder').removeClass('item-exit');
            $(this).remove();
            actionEnable = true;
        });
    }
    $('.selection-names').find('.' + pressedItemID).remove();
}

function selectionNamesOverflow() {
    $('.selection-counter').text(selectedItemsSum);
    $('.selection-names>span').not('.selection-counter').removeClass('off');
    $('.selection-counter').removeClass('on');
    let i = 0;
    let selectionNamesValidWidth = 0;
    $('.selection-names>span').not('.selection-counter').each(function () {
        selectionNamesValidWidth = selectionNamesValidWidth + $(this).width();
        i++;
        if (selectionNamesValidWidth >= $('.selection-names').width()) {
            $('.selection-counter').addClass('on');
            i = 0;
            selectionNamesValidWidth = $('.selection-counter').width();
            $('.selection-names>span').not('.selection-counter').each(function () {
                selectionNamesValidWidth = selectionNamesValidWidth + $(this).width();
                i++;
                if (selectionNamesValidWidth >= $('.selection-names').width()) {
                    $('.selection-names>span').slice(i - 1, selectedItemsSum).addClass('off');
                    return false;
                }
            });
        }
    });
}

function dragItemReturn() {
    pressStatus = 0;
    $('.drag-temp').addClass('exit');
    $(document).off('mousemove touchmove');
    $('.drag-temp').one('transitionend', function () {
        pressedItem.removeClass('ondrag');
        $('#ice-box').removeClass('ondrag');
        $(this).remove();
        iceBoxOpenStatus = 1;
        actionEnable = true;
    });
}

$('#ice-box .page button').on('mousedown touchstart', function (iceBoxGridItemEvent) {
    if (iceBoxGridItemEvent.button !== 0 && !touchCompatibility) { return }

    getPressedItemInfo($(this));
    mouseLeft = iceBoxGridItemEvent.clientX;
    mouseTop = iceBoxGridItemEvent.clientY;

    start = new Date().getTime();
    timer = setTimeout(function () {
        if (iceBoxOpenStatus !== 1) { return }

        $("[data-app-id='" + pressedItemID + "']").toggleClass('selected');
        selectedItemsSum = $('#ice-box .pages .selected').length;
        pressedItem.addClass('ondrag');

        pressStatus = 2;
        $("#ice-box .sheet").after('<button class="drag-temp selected"><img><span class="caption"></span><i class="material-icons">check_circle</i></button>');
        $(".drag-temp img").attr('src', pressedItemIcon);
        $(".drag-temp span").text(pressedItemName);
        if (pressedItem.hasClass('freeze')) {
            $(".drag-temp").addClass('freeze');
        }
        $('.drag-temp').css({
            "top": pressedItemTop + "px",
            "left": pressedItemLeft + "px"
        });
        $(document).on('mousemove touchmove', function (event) {
            mouseLeftRuntime = event.clientX;
            mouseTopRuntime = event.clientY;
            mouseMoveTop = mouseTopRuntime - mouseTop;
            mouseMoveLeft = mouseLeftRuntime - mouseLeft;
            $('.drag-temp').css({
                "--drag-item-offset-y": mouseMoveTop + "px",
                "--drag-item-offset-x": mouseMoveLeft + "px"
            });
        });
        $(".drag-temp").addClass('enter');

        actionEnable = true;
    }, longpress)
}).on('mouseleave touchmove', function (iceBoxGridItemEvent) {
    if (iceBoxGridItemEvent.button !== 0 && !touchCompatibility) { return }
    start = 0;
    clearTimeout(timer);

    if (pressStatus !== 2) { return }

    iceBoxOpenStatus = 1.3;
    pressedItem.removeClass('selected');
    $('.drag-temp').removeClass('selected');
    $('#ice-box').addClass('ondrag');
    $('#ice-box .sheet .tab-bar').removeClass('off');
    $(document).one('mouseup touchend', function () {
        dragItemReturn();
    });

}).on('mouseup touchend', function (iceBoxGridItemEvent) {
    if (iceBoxGridItemEvent.button !== 0 && !touchCompatibility) { return }

    if (new Date().getTime() < (start + longpress)) {
        clearTimeout(timer);
        if (iceBoxOpenStatus == 1) {
            $("[data-app-id='" + pressedItemID + "']").toggleClass('freeze');
        } else {
            if (pressedItem.is('.selected')) {
                $("[data-app-id='" + pressedItemID + "']").removeClass('selected');
                selectedItemsSum = $('#ice-box .pages .selected').length;
                if (selectedItemsSum == 0) {
                    if (actionEnable == false) { return }
                    actionEnable = false;
                    iceBoxControlPanelExit();
                    return
                }
                if (selectedItemsSum > 0) {
                    controlPanelAppRemove();
                }
            } else {
                $("[data-app-id='" + pressedItemID + "']").addClass('selected');
                selectedItemsSum = $('#ice-box .pages .selected').length;
                controlPanelAppAdd();
            }

            if (iceBoxOpenStatus == 2) {
                openControlPanel();
            }
            if (selectedItemsSum == 2) {
                $('.selection-folder').addClass('stable');
            }
            if (selectedItemsSum < 2) {
                $('.selection-folder').removeClass('stable');
            }
            selectionNamesOverflow();
            controlPanelActionsSwitch();
        }
    } else {
        if (actionEnable == false) { return }
        actionEnable = false;

        $(document).one('mouseup touchend', function () {
            dragItemReturn();
        });

        if (iceBoxOpenStatus == 1) {
            controlPanelAppAdd();
            openControlPanel();
        }
    }
});

$('#freeze-selected').on("click", function () {
    if (actionEnable == false) { return }
    actionEnable = false;

    $(".selected").addClass('freeze');
    controlPanelActionsSwitch();
});

$('#defrost-selected').on("click", function () {
    if (actionEnable == false) { return }
    actionEnable = false;

    $(".selected").removeClass('freeze');
    controlPanelActionsSwitch();
});

$('#move-out').on("click", function () {
    if (actionEnable == false) { return }
    actionEnable = false;

    $("#ice-box .pages .selected").remove();
    $(".selected").find('.check-box').addClass('unchecked');
    $(".selected").find('.check-box').removeClass('checked');
    $(".selected").removeClass('freeze selected');

    iceBoxControlPanelExit();
});

$('#frozen-all').on("click", function () {
    if (actionEnable == false) { return }
    actionEnable = false;

    $("#ice-box .page button").addClass('freeze');
    iceBoxMainExit();
});

$('#theme-switch').on("click", function (event) {
    openSnackbar($('.snackbar'));
});

let starter = $(document);

$('#back, #home, #ice-box>.scrim').on("click", function () {
    if (actionEnable == false) { return }
    actionEnable = false;

    starter = $(this);
    if (iceBoxOpenStatus == 0) {
        actionEnable = true;
    }
    if (iceBoxOpenStatus == 1) {
        iceBoxMainExit();
    }
    if (iceBoxOpenStatus == 1.2) {
        if (starter.is('#back')) {
            iceBoxControlPanelExit();
        }
        if (starter.is('#home')) {
            iceBoxMainExit();
            iceBoxControlPanelExit();
        }
    }
    if (iceBoxOpenStatus == 2) {
        iceBoxSecondaryExit();
    }
    if (iceBoxOpenStatus == 2.4) {
        if (starter.is('#back')) {
            console.log('a');
            closeMenu($('#filter-menu'));
            iceBoxOpenStatus = 2;
        }
        if (starter.is('#home')) {
            iceBoxSecondaryExit();
        }
    }
});

function iceBoxMainExit() {
    $('#ice-box').css("--sheet-height", $('#ice-box .sheet').height() + "px");
    $('#ice-box').addClass('custom-exit');
    $('#ice-box').removeClass('enter stable');
    $('#ice-box .scrim').one('animationend', function () {
        $('#ice-box').removeClass('on custom-exit');
        $("#ice-box").removeAttr("style");
        iceBoxOpenStatus = 0;
        actionEnable = true;
    });
}

function iceBoxControlPanelExit() {
    timeEndElement = $('#ice-box>.scrim');
    if (starter.is('#home') == false) {
        $('#ice-box').addClass('control-panel-exit');
        timeEndElement = $('.control-panel');
    }
    $('.selected').removeClass('selected');
    $('.control-panel').addClass('exit');
    timeEndElement.one('animationend', function () {
        $('.selection-folder img').remove();
        $('.selection-names span').not('.selection-counter').remove();
        $('.selection-counter').removeClass('on');
        $('#ice-box').removeClass('onselect control-panel-exit');
        $('.control-panel').removeClass('on stable exit');
        $('.control-panel .selection-folder').removeClass('stable');
        $('#freeze-selected, #defrost-selected').removeClass('on');
        iceBoxOpenStatus = iceBoxOpenStatus - 0.2;
        actionEnable = true;
    });
}

function iceBoxSecondaryExit() {
    $('#ice-box').css("--secondary-action-reveal-radius", getRevealRadius($('#frozen-all'), $('.secondary-actions')) + "px");
    if (simulatorWidth < 700) {
        $('.system-bars .status-bar').addClass('lighten');
        $('.system-bars .status-bar').removeClass('dark');
    }
    if (starter.is('#back')) {
        $('#ice-box').addClass('secondary-actions-exit');
        $('.secondary-actions, .secondary-actions .on').addClass('exit');
        $('#ice-box').removeClass('onedit onsettings');
        $('.edit-list, .settings').removeClass('enter');

        $('.sheet').one('animationend', function () {
            $('.system-bars .status-bar').removeClass('lighten');
            $('#ice-box').removeClass('secondary-actions-exit');
            $('.secondary-actions').removeClass('on stable exit');
            $('.edit-list, .settings').removeClass('on stable exit');
            $('#ice-box').css("--secondary-action-reveal-radius", "");
            iceBoxOpenStatus = 1;
            actionEnable = true;
        });
    } else {
        $('#ice-box').addClass('exit');
        $('#ice-box').one('animationend', function () {
            $('.system-bars .status-bar').removeClass('lighten');
            $('#ice-box').removeClass('on enter stable exit onedit onsettings');
            $('.edit-list, .settings').removeClass('on enter');
            $('.secondary-actions').removeClass('on stable');
            $('#filter-menu').removeClass('on stable exit');
            $("#ice-box").removeAttr("style");
            iceBoxOpenStatus = 0;
            actionEnable = true;
        });
    }
}