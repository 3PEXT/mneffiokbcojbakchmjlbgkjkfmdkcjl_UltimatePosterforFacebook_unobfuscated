var callback = [];

function sendMessage(msg, callbackfn) {
    if (callbackfn != null) {
        callback.push(callbackfn);
        msg.callback = "yes";
    }
    chrome.runtime.sendMessage(msg, callbackfn);
}


$(document).ready(function() {
    var e_fb_msg = '';
    var e_fb_urls = [];
    var urlArray = [];
    chrome.storage.local.get(['e_fb_urls', 'e_fb_msg'], function(result) {
        if (result) {
            e_fb_urls = JSON.parse(result.e_fb_urls);
            urlArray = e_fb_urls;
            e_fb_msg = result.e_fb_msg;

            postToGroup();
        }
    });

    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    function fireCustomHtmlEvent(node, eventName) {
        if (!node) {
            return;
        }
        // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
        var doc;
        if (node.ownerDocument) {
            doc = node.ownerDocument;
        } else if (node.nodeType == 9) {
            // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
            doc = node;
        } else {
            throw new Error("Invalid node passed to fireEvent: " + node.id);
        }

        if (node.dispatchEvent) {
            // Gecko-style approach (now the standard) takes more work
            var eventClass = "";

            // Different events have different event classes.
            // If this switch statement can't map an eventName to an eventClass,
            // the event firing is going to fail.
            switch (eventName) {
                case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
                case "mousedown":
                case "mouseup":
                    eventClass = "MouseEvents";
                    break;

                case "focus":
                case "change":
                case "blur":
                case "select":
                    eventClass = "HTMLEvents";
                    break;

                default:
                    throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                    break;
            }
            var event = doc.createEvent(eventClass);
            event.initEvent(eventName, true, true); // All events created as bubbling and cancelable.

            event.synthetic = true; // allow detection of synthetic events
            // The second parameter says go ahead with the default action
            node.dispatchEvent(event, true);
        } else if (node.fireEvent) {
            // IE-old school style, you can drop this if you don't need to support IE8 and lower
            var event = doc.createEventObject();
            event.synthetic = true; // allow detection of synthetic events
            node.fireEvent("on" + eventName, event);
        }

    }

    function postToGroup() {
        var extension_popup_overlay = "<div class='e_fb_groups_overlay'>&nbsp;</div>";

        $('body').append(extension_popup_overlay);
        var progress_html = "<div class='progress_parent'><div class='progress_htm'><div style='font-size:20px'>Posting in </div> <div id='progress_html'>Group : </div> <br> <div id='posting_status'>Please Wait...</div></div></div>";
        $('body').append(progress_html);

        function getUrlParameter(sParam) {
            var sPageURL = window.location.search.substring(1),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
                }
            }
        };

        var e_fb_tag = getUrlParameter('e_fb_tag');
        var initiallength = $("p:contains('" + e_fb_msg + "')").length;
        //Check if the url is valid to post something
        if (typeof e_fb_tag !== "undefined" && e_fb_tag == "send") {
            var current_url = window.location.href;
            if ($.inArray(current_url, e_fb_urls) !== -1 && current_url.indexOf("groups") > 0) {
                var isFound = false;
                $('body').find('.e_fb_groups_overlay').show();
                var groupname = e_fb_urls[0].split("/groups/")[1].split("?")[0];
                document.getElementById('progress_html').innerHTML = "<h1><b>Group :</b>" + groupname;
                "</h1>"
                $('.progress_parent').show();
                if ($("button:contains('Join Group')").length > 0) {
                    isFound = true;
                    document.getElementById('posting_status').innerHTML = "<h2>Please join the group first.</h2>";
                    var remove_Item = current_url;
                    urlArray = $.grep(urlArray, function(value) {
                        return value != remove_Item;
                    });

                    chrome.storage.local.set({
                        'e_fb_urls': JSON.stringify(urlArray)
                    }, function(result) {
                        if (urlArray.length == 0) {
                            var tabUrl = window.location.href;
                            sendMessage({
                                method: "closePreviewTab",
                                "data": tabUrl
                            });
                        } else {
                            window.location.href = urlArray[0];
                        }
                    });

                }

                if ($('button[value="Discuss"]').length > 0) {
                    isFound = true;
                    document.getElementById('posting_status').innerHTML = "<h2>Posting not allowed in sell group.</h2>";
                    document.getElementById('posting_status').innerHTML = "<h2>Please join the group first.</h2>";
                    var remove_Item = current_url;
                    urlArray = $.grep(urlArray, function(value) {
                        return value != remove_Item;
                    });

                    chrome.storage.local.set({
                        'e_fb_urls': JSON.stringify(urlArray)
                    }, function(result) {
                        if (urlArray.length == 0) {
                            var tabUrl = window.location.href;
                            sendMessage({
                                method: "closePreviewTab",
                                "data": tabUrl
                            });
                        } else {
                            window.location.href = urlArray[0];
                        }
                    });
                }

                if (document.querySelectorAll("[label='Sell Something']").length > 0) {
                    isFound = true;
                    document.getElementById('posting_status').innerHTML = "<h2>Posting not allowed in sell group.</h2>";
                    document.getElementById('posting_status').innerHTML = "<h2>Please join the group first.</h2>";
                    var remove_Item = current_url;
                    urlArray = $.grep(urlArray, function(value) {
                        return value != remove_Item;
                    });

                    chrome.storage.local.set({
                        'e_fb_urls': JSON.stringify(urlArray)
                    }, function(result) {
                        if (urlArray.length == 0) {
                            var tabUrl = window.location.href;
                            sendMessage({
                                method: "closePreviewTab",
                                "data": tabUrl
                            });
                        } else {
                            window.location.href = urlArray[0];
                        }
                    });
                }

                if ($('title').text() == "Content not found" || $('span:contains(This content isn\'t available at the moment)').length != 0) {
                    isFound = true;
                    document.getElementById('posting_status').innerHTML = "<h2>GROUP NOT FOUND</h2>";
                    var remove_Item = current_url;
                    urlArray = $.grep(urlArray, function(value) {
                        return value != remove_Item;
                    });

                    chrome.storage.local.set({
                        'e_fb_urls': JSON.stringify(urlArray)
                    }, function(result) {
                        var timeout = (Math.floor(Math.random() * 10) + 5) * 1000;
                        setTimeout(() => {
                            if (urlArray.length == 0) {
                                setTimeout(function() {
                                    var tabUrl = window.location.href;
                                    sendMessage({
                                        method: "closePreviewTab",
                                        "data": tabUrl
                                    });
                                }, 1000)
                            } else {
                                setTimeout(function() {
                                    window.location.href = urlArray[0];
                                }, 1000)

                            }
                        }, timeout)

                    });
                }

                if ($("div:contains('Sorry, this content isn't available at the moment')").length == 0 && $("button:contains('Join Group')").length == 0 && document.querySelectorAll("[label='Sell Something']").length == 0 && $('title').text() != "Content not found") {

                    waitForElFb('[onclick^="if (window.bgUploadInlineComposerCallbac"]', function() {
                        isFound = true;
                        var postDiv = $('[onclick^="if (window.bgUploadInlineComposerCallbac"]');

                        if (postDiv.length != 0) {
                            fireCustomHtmlEvent($(postDiv)[0], "click");

                            waitForElFb('input[name="message"]', function() {
                                var textArea = $('#composer-main-view-id').find('textarea');
                                var inut = $('#composer-main-view-id').find('input[name="message"]');
                                $(textArea).focus();
                                $(textArea).keyup();
                                $(textArea).change()
                                fireCustomHtmlEvent($(textArea)[0], "focus");
                                $(textArea).val(e_fb_msg).vTextEvent();
                                fireCustomHtmlEvent($(textArea)[0], "change");
                                fireCustomHtmlEvent($(inut)[0], "focus");
                                $(inut).val(e_fb_msg).vTextEvent();
                                fireCustomHtmlEvent($(inut)[0], "change");
                                setTimeout(function() {
                                    if ($('#composer-main-view-id').find('textarea').val() == "" || $('#composer-main-view-id').find('input[name="message"]').val() == "") {
                                        location.reload();
                                        return
                                    }
                                    fireCustomHtmlEvent($('#composer-main-view-id > div.acw > div > div > button')[0], "click");
                                    console.log('click work')
                                    e_fb_msg = e_fb_msg.split("\n")[0];

                                    setTimeout(function() {
                                        var times = 0;
                                        var poststatus = setInterval(() => {
                                            times++;
                                            if ($("p:contains('" + e_fb_msg + "')").length != 0 || $("a:contains('Manage your pending')").length > 0 || $(".composerPostSection").find(".commentable_item").length > 0 || $(".composerPostSection").find("div").length > 0) {

                                                console.log("Post is cpmplete");
                                                if (document.getElementById('posting_status')) {
                                                    document.getElementById('posting_status').innerHTML = "<h2>Complete</h2>";
                                                }

                                                clearInterval(poststatus);
                                                var remove_Item = current_url;
                                                urlArray = $.grep(urlArray, function(value) {
                                                    return value != remove_Item;
                                                });

                                                chrome.storage.local.set({
                                                    'e_fb_urls': JSON.stringify(urlArray)
                                                }, function(result) {
                                                    if (urlArray.length == 0) {
                                                        var tabUrl = window.location.href;
                                                        sendMessage({
                                                            method: "closePreviewTab",
                                                            "data": tabUrl
                                                        });
                                                    } else {
                                                        var time = (Math.floor(Math.random() * 10) + 5) * 1000;
                                                        setTimeout(() => {
                                                            location.replace(urlArray[0]);
                                                        }, time)
                                                    }
                                                });
                                            } else if (times > 10) {
                                                console.log("Post is cpmplete");
                                                if (document.getElementById('posting_status')) {
                                                    document.getElementById('posting_status').innerHTML = "<h2>Complete</h2>";
                                                }

                                                clearInterval(poststatus);
                                                var remove_Item = current_url;
                                                urlArray = $.grep(urlArray, function(value) {
                                                    return value != remove_Item;
                                                });

                                                chrome.storage.local.set({
                                                    'e_fb_urls': JSON.stringify(urlArray)
                                                }, function(result) {
                                                    if (urlArray.length == 0) {
                                                        var tabUrl = window.location.href;
                                                        sendMessage({
                                                            method: "closePreviewTab",
                                                            "data": tabUrl
                                                        });
                                                    } else {

                                                        setTimeout(() => {

                                                            location.replace(urlArray[0]);
                                                        }, Math.floor(Math.random() * 10) + 5)

                                                    }
                                                });
                                            }
                                        }, 1400)
                                    }, 1000)
                                }, 3000);

                            })

                        }
                    })

                }
                if (!isFound) {
                    document.getElementById('posting_status').innerHTML = "<h2>GROUP NOT FOUND</h2>";
                    var remove_Item = current_url;
                    urlArray = $.grep(urlArray, function(value) {
                        return value != remove_Item;
                    });

                    chrome.storage.local.set({
                        'e_fb_urls': JSON.stringify(urlArray)
                    }, function(result) {
                        var timeout = (Math.floor(Math.random() * 10) + 5) * 1000;
                        setTimeout(() => {
                            if (urlArray.length == 0) {
                                setTimeout(function() {
                                    var tabUrl = window.location.href;
                                    sendMessage({
                                        method: "closePreviewTab",
                                        "data": tabUrl
                                    });
                                }, 1000)
                            } else {
                                setTimeout(function() {
                                    window.location.href = urlArray[0];
                                }, 1000)

                            }
                        }, timeout)

                    });

                }
            }
        }
    }


    var waitForElFbPost = function(e_fb_msg, callback) {

        if ($('#m_group_stories_container').find("p:contains('" + e_fb_msg + "'):eq(0)").length != 0 || $("a:contains('Manage your pending')").length > 0 || $(".composerPostSection").find(".commentable_item").length > 0 || $(".composerPostSection").find("div").length > 0) {
            callback();
        } else {
            setTimeout(function() {
                waitForElFbPost(e_fb_msg, callback);
            }, 500);
        }
    };

    var waitForElFb = function(selector, callback) {
        if (jQuery(selector).length != 0) {
            callback();
        } else {
            setTimeout(function() {
                waitForElFb(selector, callback);
            }, 500);
        }
    };

})

jQuery.fn.extend({
    'vchange': function() {
        var change_event = document.createEvent('HTMLEvents')
        change_event.initEvent('change', false, true)
        return $(this).each(function() {
            $(this)[0].dispatchEvent(change_event)
        })
    },
    'vclick': function() {
        var click_event = document.createEvent('HTMLEvents')
        click_event.initEvent('click', false, true)
        return $(this).each(function() {
            $(this)[0].dispatchEvent(click_event)
        })
    },
    'vblur': function() {
        var click_event = document.createEvent('HTMLEvents')
        click_event.initEvent('blur', false, true)
        return $(this).each(function() {
            $(this)[0].dispatchEvent(click_event)
        })
    },
    'vkeyup': function() {
        var keyup_event = document.createEvent('HTMLEvents')
        keyup_event.initEvent('keyup', false, true)
        return $(this).each(function() {
            $(this)[0].dispatchEvent(keyup_event)
        })
    },
    'vkeypress': function() {
        var keyup_event = document.createEvent('HTMLEvents')
        keyup_event.initEvent('keypress', false, true)
        return $(this).each(function() {
            $(this)[0].dispatchEvent(keyup_event)
        })
    },
    'vmouseup': function() {
        var mouseEvent = document.createEvent('MouseEvents');
        mouseEvent.initEvent('mouseup', true, true);
        return $(this).each(function() {
            $(this)[0].dispatchEvent(mouseEvent)
        })
    },
    'vmousedown': function() {
        var mouseEvent = document.createEvent('MouseEvents');
        mouseEvent.initEvent('mousedown', true, true);
        return $(this).each(function() {
            $(this)[0].dispatchEvent(mouseEvent)
        })
    },
    'vTextEvent': function() {
        var evt = new Event('input', {
            bubbles: true
        });
        return $(this).each(function() {
            $(this)[0].focus();
            $(this)[0].dispatchEvent(evt)
        })
    }
})