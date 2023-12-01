chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // localStorage.setItem("customer_details",request.action);
    chrome.storage.sync.set({
        "customer_details": request.action
    }, function() {});
    chrome.storage.sync.set({
        "categories": ""
    }, function() {});
});



$(document).ready(function() {

    console.log(localStorage);
    chrome.runtime.sendMessage({
        method: "get_customer_details"
    }, function(data) {
        console.log(data);
        if (data.customer_details == undefined) {
            console.log('customer_details not found')
            return;
        }
        customer_details = JSON.parse(data.customer_details);


        $.ajax({
            url: 'https://burroughsmedia.com/poster_for_facebook/api/customer-verification/' + customer_details.id,
            type: 'GET',
            success: function(res) {
                console.log(res);
                res = JSON.parse(res);


                if (res.success) {

                    if (res.msg == "Your trial start date is empty") {

                        $('body').find('.group_details').html('<div class="group_details_row"><div class="start_free_trial_container"><button id="start_free_trial" data-customer_id="' + customer_details.id + '">Start Free Trial</button></div></div>');
                    } else {



                        //$('body').find('.group_details').html('<div class="group_details_row"><div class="start_free_trial_container">'+res.msg+'</div></div>');

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

                        console.log(JSON.parse(localStorage.getItem('e_fb_urls')));

                        //Check if the url is valid to post something
                        if (typeof e_fb_tag !== "undefined" && e_fb_tag == "send" && false) {
                            var current_url = window.location.href;

                            console.log('current_url');
                            console.log(current_url);

                            var urlArray = JSON.parse(localStorage.getItem('e_fb_urls'));
                            var e_fb_msg = localStorage.getItem('e_fb_msg');

                            console.log('urlArray');
                            console.log(urlArray);

                            console.log('e_fb_msg');
                            console.log(e_fb_msg);

                            console.log(current_url.indexOf("groups"), $.inArray(current_url, urlArray));

                            if ($.inArray(current_url, urlArray) !== -1 && current_url.indexOf("groups") > 0) {



                                if ($("div[aria-label='Account']").length > 0 && false) {
                                    //alert("here");
                                    localStorage.setItem("newfb", 1);
                                    setTimeout(() => {
                                        switchToClassic()
                                    }, 1000)

                                } else {

                                    $('body').find('.e_fb_groups_overlay').show();

                                    var groupname = urlArray[0].split("/groups/")[1].split("?")[0];
                                    document.getElementById('progress_html').innerHTML = "<h1><b>Group :</b>" + groupname;
                                    "</h1>"

                                    $('.progress_parent').show();

                                    var urlNewArray = JSON.parse(localStorage.getItem('e_fb_urls'));

                                    if ($("a:contains('Join group')").length > 0) {
                                        document.getElementById('posting_status').innerHTML = "<h2>Please join the group first.</h2>";
                                    }

                                    if (document.querySelectorAll("[label='Sell Something']").length > 0) {
                                        document.getElementById('posting_status').innerHTML = "<h2>Posting not allowed in sell group.</h2>";
                                    }

                                    if ($("div:contains('Sorry, this content isn't available at the moment')").length == 0 && $("a:contains('Join group')").length == 0 && document.querySelectorAll("[label='Sell Something']").length == 0) {





                                        setTimeout(function() {

                                            var initiallength = $("p:contains('" + e_fb_msg + "')").length;
                                            delay(function() {

                                                var groupUrls = window.location.href;
                                                const match = groupUrls.match(/\/groups\/([\w.]*)\/?/);
                                                const userMatch = groupUrls.match(/\/user\/([\w.]*)\/?/);
                                                const groupId = match[1] !== null ? match[1] : null;
                                                const userId = userMatch[1] !== null ? userMatch[1] : null;
                                                postToGroup(groupId, userId, e_fb_msg).then((data) => {
                                                    console.log("Post is cpmplete");
                                                    if (document.getElementById('posting_status')) {
                                                        document.getElementById('posting_status').innerHTML = "<h2>Complete</h2>";
                                                    }

                                                    clearInterval(poststatus);
                                                    var remove_Item = current_url;
                                                    urlArray = $.grep(urlArray, function(value) {
                                                        return value != remove_Item;
                                                    });

                                                    localStorage.setItem('e_fb_urls', JSON.stringify(urlArray));
                                                    if (urlArray.length == 0) {
                                                        console.log(localStorage.getItem("newfb"));
                                                        if (localStorage.getItem("newfb") == 1) {
                                                            $(".e_fb_post_popup").show();
                                                            localStorage.setItem("newfb", 0);
                                                            switchToNew();

                                                        } else {
                                                            $(".e_fb_post_popup").show();
                                                            setTimeout(() => {
                                                                window.location.reload();
                                                            }, 1000);
                                                        }

                                                    } else {

                                                        window.location.href = urlArray[0];
                                                    }
                                                });
                                                /*
								    $("div[data-pagelet='GroupInlineComposer']").find("div[role='button']").first().click();
								     delay(function(){
								     $("div[role='presentation']").find('div[data-contents="true"]').click();
								     fireEvent('click', $("div[role='presentation']").find('div[data-contents="true"]')[0], 13);
								     fireEvent('focus', $("div[role='presentation']").find('div[data-contents="true"]')[0], 13);
								     fireEvent('click', $("div[role='presentation']").find('div[contenteditable="true"]')[0], 13);
								     fireEvent('keydown', $("div[role='presentation']").find('div[contenteditable="true"]')[0], 13);
								     fireEvent('keydown', $("div[role='presentation']").find('div[contenteditable="true"]')[0], 69);
								     fireEvent('keydown', $("div[role='presentation']").find('div[contenteditable="true"]')[0], 13);
								     fireEvent('keydown', $("div[role='presentation']").find('div[data-contents="true"]')[0], 68);
									   $("div[role='presentation']").find('div[data-contents="true"]').html(e_fb_msg);
									    delay(function(){
										   $("div[aria-label='Post']").find("div[data-visualcompletion='ignore']").click()
										 }, 2000 );
									 }, 2000 ); */
                                            }, 4000);

                                            var poststatus = setInterval(() => {
                                                //console.log($("div[role='article']"));
                                                if ($("p:contains('" + e_fb_msg + "')").length > initiallength || $("a:contains('Manage your pending')").length > 0 || $(".composerPostSection").find(".commentable_item").length > 0 || $(".composerPostSection").find("div").length > 0) {

                                                    console.log("Post is cpmplete");
                                                    if (document.getElementById('posting_status')) {
                                                        document.getElementById('posting_status').innerHTML = "<h2>Complete</h2>";
                                                    }

                                                    clearInterval(poststatus);
                                                    var remove_Item = current_url;
                                                    urlArray = $.grep(urlArray, function(value) {
                                                        return value != remove_Item;
                                                    });

                                                    localStorage.setItem('e_fb_urls', JSON.stringify(urlArray));
                                                    if (urlArray.length == 0) {
                                                        console.log(localStorage.getItem("newfb"));
                                                        if (localStorage.getItem("newfb") == 1) {
                                                            $(".e_fb_post_popup").show();
                                                            localStorage.setItem("newfb", 0);
                                                            switchToNew();

                                                        } else {
                                                            $(".e_fb_post_popup").show();
                                                            setTimeout(() => {
                                                                window.location.reload();
                                                            }, 1000);
                                                        }

                                                    } else {

                                                        window.location.href = urlArray[0];
                                                    }

                                                }
                                            }, 1000)

                                        }, 4000);

                                    } else {

                                        var remove_Item = current_url;
                                        urlArray = $.grep(urlArray, function(value) {
                                            return value != remove_Item;
                                        });

                                        localStorage.setItem('e_fb_urls', JSON.stringify(urlArray));
                                        window.location.href = urlArray[0];

                                    }
                                }

                            }
                        }

                        var action_btn = "<div class='e_fb_action_btn'>Post On Groups</div>";

                        $('body').append(action_btn);

                        var prevUlrs = localStorage.getItem('e_fb_post_urls');
                        var allCategories = localStorage.getItem('e_fb_categories');


                        console.log('prevUlrs');
                        console.log(prevUlrs);
                        if (prevUlrs == null) {
                            prevUlrs = "";
                        }

                        if (allCategories == null) {
                            allCategories = "";
                        }

                        var extension_popup_html = "<div class='e_fb_popup_1'><div class='e_fb_popup_close_1'>X</div><div class='e_fb_popup_action_holder'> <div class='e_fb_groups_action_btn e_fb_add_group'>Add New Category </div><div class='e_fb_groups_action_btn e_fb_cancel_1'>Cancel </div> </div></div><div class='e_fb_popup'><div class='e_fb_popup_close'>X</div><div class='e_fb_popup_heading'>Add group urls:</div><div class='e_fb_add_category'></div><div class='e_fb_label'>Groups:</div><div class='e_fb_groups_finetip'>Insert each url in a new line followed by a comma.</div><div class='e_fb_groups_finetip'>You must belong to the groups you post to.</div> <div class='e_fb_groups_finetip'>Doesn't post to SALES groups where the posting format is different than regular groups.</div><textarea class='e_fb_groups_url urls' id='e_fb_groups_url'></textarea><div class='e_fb_label'>Your message to post:</div><textarea class='e_fb_groups_message' id='e_fb_groups_message'></textarea><div class='e_fb_left_side_btn' style='display:none'><div class='e_fb_groups_action_btn e_fb_delete'>Delete Group</div><div class='e_fb_groups_action_btn e_fb_update_group'>Update Group</div></div> <div class='e_fb_popup_action_holder'> <div class='e_fb_groups_action_btn e_fb_submit_group'>Start Posting </div> <div class='e_fb_groups_action_btn e_fb_cancel'>Cancel </div> </div>";
                        var selectCategoryHtml = "Select Category&nbsp;&nbsp;&nbsp;&nbsp;<select class='e_fb_category_dropdown'><option value=''>Please select any category</option></select>&nbsp;&nbsp;&nbsp;<a href='javascript:;' class='e_fb_select_add_new_category'>Add New Category</a>"
                        var addCategoryHtml = "Category Name&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' class='e_fb_category_name' placeholder='Please Enter Category Name'>&nbsp;&nbsp;&nbsp;<a href='javascript:;' class='e_fb_slect_existing_category'>Select Existing Category</a>"
                        $('body').append(extension_popup_html);

                        $('body').on('click', '.e_fb_select_add_new_category', function() {
                            $('body').find(".e_fb_add_category").html(addCategoryHtml);
                            $('body').find(".e_fb_submit_group").addClass("e_fb_add_new_category");
                            $('.e_fb_left_side_btn').hide();
                        });

                        $('body').on('click', '.e_fb_slect_existing_category', function() {

                            $('.e_fb_left_side_btn').hide();
                            $('body').find(".e_fb_add_category").find("select").val()
                            $('body').find(".e_fb_add_category").html(selectCategoryHtml);

                            $('body').find(".e_fb_submit_group").removeClass("e_fb_add_new_category");
                            var allCategories = JSON.parse(localStorage.getItem('e_fb_categories'));

                            chrome.runtime.sendMessage({
                                method: "get_customer_details"
                            }, function(data) {

                                customer_details = JSON.parse(data.customer_details);
                                $.ajax({
                                    url: 'https://burroughsmedia.com/poster_for_facebook/api/all-groups',
                                    type: 'GET',
                                    data: {
                                        'customer_id': customer_details.id
                                    },
                                    success: function(res) {
                                        if (allCategories == null) {
                                            allCategories = "";
                                        }
                                        $.each(JSON.parse(res).result, function(i, e) {
                                            $('select.e_fb_category_dropdown').append($("<option></option>").attr("value", e.id).text(e.category));
                                        });
                                    }
                                });

                            });

                        });

                        $('body').on('change', 'select.e_fb_category_dropdown', function() {
                            var category = $(this).val();
                            $('.e_fb_left_side_btn').hide();

                            if (category.trim() == '') {
                                $("#e_fb_groups_url").val('');
                                return;
                            }
                            chrome.storage.local.get('categories', function(data) {
                                console.log(data);
                                var categoryUrl = data.categories;

                                var content = JSON.parse(categoryUrl[category]);
                                var urls_to_put = '';
                                if ($.isArray(content)) {
                                    $.each(content, function(i, e) {
                                        urls_to_put += e + "\n";
                                    });
                                } else {
                                    var urls_to_put = content;
                                }
                                $('.e_fb_left_side_btn').show();
                                $("#e_fb_groups_url").val(urls_to_put);
                            });

                        })

                        //update group
                        $('body').on('click', '.e_fb_update_group', function() {
                            var categoryKey = $('select.e_fb_category_dropdown option:selected').val();
                            var categoryVal = $('select.e_fb_category_dropdown option:selected').text();
                            var urls = $.trim($('#e_fb_groups_url').val());
                            var urls_for_API = urls.split(/\r?\n/);
                            chrome.runtime.sendMessage({
                                method: "setgroups",
                                catName: categoryVal,
                                urls_for_API: urls_for_API
                            }, function(data) {
                                //done updated;
                                $('.e_fb_post_action_popup h3').text('Category: ' + categoryVal + ' is updated.');
                                $('.e_fb_post_action_popup').show();
                                $('.e_fb_post_action_popup').delay(1800).fadeOut('slow');
                                $('.e_fb_action_btn').click();
                                $("#e_fb_groups_url").val('');
                                $('.e_fb_left_side_btn').hide();
                            })

                        })

                        //delete group
                        $('body').on('click', '.e_fb_delete', function() {
                            var categoryKey = $('select.e_fb_category_dropdown option:selected').val();
                            var categoryVal = $('select.e_fb_category_dropdown option:selected').text();
                            var urls = $.trim($('#e_fb_groups_url').val());
                            var urls_for_API = urls.split(/\r?\n/);
                            chrome.runtime.sendMessage({
                                method: "deletegroups",
                                catName: categoryVal,
                                urls_for_API: urls_for_API
                            }, function(data) {
                                //done updated;
                                $('.e_fb_post_action_popup h3').text('Category: ' + categoryVal + ' is deleted.');
                                $('.e_fb_post_action_popup').show();
                                $('.e_fb_post_action_popup').delay(1800).fadeOut('slow');
                                $('.e_fb_action_btn').click();
                                $("#e_fb_groups_url").val('');
                                $('.e_fb_left_side_btn').hide();

                            })
                        })

                        $('body').on('click', '.e_fb_action_btn', function() {
                            // var allCategories = localStorage.getItem('e_fb_categories');
                            var allCategories = {};
                            $('.e_fb_groups_overlay').show();
                            setTimeout(() => {

                                chrome.storage.local.get('categories', function(data) {

                                    $('.e_fb_left_side_btn').hide();
                                    $("#e_fb_groups_url").val("");
                                    $('body').find(".e_fb_add_category").html(selectCategoryHtml);


                                    chrome.runtime.sendMessage({
                                        method: "get_customer_details"
                                    }, function(data) {
                                        customer_details = JSON.parse(data.customer_details);
                                        $.ajax({
                                            url: 'https://burroughsmedia.com/poster_for_facebook/api/all-groups',
                                            type: 'GET',
                                            data: {
                                                'customer_id': customer_details.id
                                            },
                                            success: function(res) {
                                                var cats = JSON.parse(res).result;
                                                if ($.isArray(cats) && cats.length != 0) {
                                                    $.each(cats, function(i, e) {
                                                        $('select.e_fb_category_dropdown').append($("<option></option>").attr("value", e.id).text(e.category));
                                                        allCategories[e.id] = e.group_urls;

                                                        if (i + 1 == cats.length) {
                                                            console.log("here123444", allCategories);
                                                            chrome.storage.sync.remove("categories");
                                                            chrome.storage.local.set({
                                                                "categories": allCategories
                                                            }, function() {});
                                                        }
                                                    });
                                                } else {
                                                    $('body').find(".e_fb_submit_group").addClass("e_fb_add_new_category");
                                                    $('body').find(".e_fb_add_category").html("Category Name&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' class='e_fb_category_name' placeholder='Please Enter Category Name'>");
                                                }
                                            }
                                        });
                                    });


                                });

                            }, 1000)

                            $('.e_fb_popup').show(200);

                        });

                        $('body').on('click', '.e_fb_cancel_1, e_fb_popup_close_1', function() {

                            $('.e_fb_groups_overlay').hide();
                            $('.e_fb_popup_1').hide();

                        });

                        $('body').on('click', '.e_fb_popup_close, .e_fb_cancel', function() {

                            $('.e_fb_groups_overlay').hide();
                            $('.e_fb_popup').hide();

                        });

                        var extension_post_popup_html = "<div class='e_fb_post_popup'><h3>Facebook posting is done</h3></div>"
                        var extension_post_actionpopup_html = "<div class='e_fb_post_action_popup'><h3></h3></div>"
                        $('body').append(extension_post_popup_html);
                        $('body').append(extension_post_actionpopup_html);



                        //Take action on submiting the form
                        $('body').on('click', '.e_fb_submit_group', function() {


                            var mesage_top_post = $.trim($('#e_fb_groups_message').val());
                            var urls = $.trim($('#e_fb_groups_url').val());
                            var urls_for_API = urls.split(/\r?\n/);

                            if ($(this).hasClass("e_fb_add_new_category")) {
                                var catName = $.trim($(".e_fb_category_name").val());
                                catName = catName.toLowerCase();
                                var categories = JSON.parse(localStorage.getItem('e_fb_categories'));
                                var categoryUrl = JSON.parse(localStorage.getItem('e_fb_category_urls'));
                                console.log($.inArray(catName, categories));
                                if (categories != null && catName != "" && $.inArray(catName, categories) < 0 && mesage_top_post != "" && urls != "") {
                                    categoryUrl[categories.length] = urls;
                                    categories[categories.length] = catName;
                                    localStorage.setItem('e_fb_categories', JSON.stringify(categories));
                                    localStorage.setItem('e_fb_category_urls', JSON.stringify(categoryUrl));

                                    chrome.runtime.sendMessage({
                                        method: "setgroups",
                                        catName: catName,
                                        urls_for_API: urls_for_API
                                    }, function(data) {
                                        // customer_details = JSON.parse(data.customer_details);
                                        // console.log("get customer_details");
                                        // console.log(customer_details);
                                        // $.ajax({ 
                                        //     url: 'https://burroughsmedia.com/poster_for_facebook/api/groups',
                                        //     type: 'POST',
                                        //     data: {'customer_id': customer_details.id, 'category': catName, 'group_urls': JSON.stringify(urls_for_API)},
                                        //     success: function(result){
                                        //       console.log('group result');
                                        //       console.log(result);
                                        //     }
                                        //   });
                                    });


                                } else if (categories != null && catName != "" && $.inArray(catName, categories) > -1 && mesage_top_post != "" && urls != "") {
                                    var categoryKey = Object.keys(categories).find(key => categories[key] === catName);
                                    console.log(categoryKey);
                                    categoryUrl[categoryKey] = urls;
                                    localStorage.setItem('e_fb_category_urls', JSON.stringify(categoryUrl));

                                    chrome.runtime.sendMessage({
                                        method: "setgroups",
                                        catName: catName,
                                        urls_for_API: urls_for_API
                                    }, function(data) {
                                        // customer_details = JSON.parse(data.customer_details);
                                        // console.log("get customer_details");
                                        // console.log(customer_details);
                                        // $.ajax({ 
                                        //     url: 'https://burroughsmedia.com/poster_for_facebook/api/groups',
                                        //     type: 'POST',
                                        //     data: {'customer_id': customer_details.id, 'category': catName, 'group_urls': JSON.stringify(urls_for_API)},
                                        //     success: function(result){
                                        //       console.log('group result');
                                        //       console.log(result);
                                        //     }
                                        //   });
                                    });



                                } else if (catName != "" && mesage_top_post != "" && urls != "" && categories == null) {
                                    var categories = [];
                                    var categoryUrl = [];
                                    categories[0] = catName;
                                    categoryUrl[0] = urls;
                                    localStorage.setItem('e_fb_categories', JSON.stringify(categories));
                                    localStorage.setItem('e_fb_category_urls', JSON.stringify(categoryUrl));

                                    chrome.runtime.sendMessage({
                                        method: "setgroups",
                                        catName: catName,
                                        urls_for_API: urls_for_API
                                    }, function(data) {
                                        // customer_details = JSON.parse(data.customer_details);
                                        // console.log("get customer_details");
                                        // console.log(customer_details);
                                        // $.ajax({ 
                                        //     url: 'https://burroughsmedia.com/poster_for_facebook/api/groups',
                                        //     type: 'POST',
                                        //     data: {'customer_id': customer_details.id, 'category': catName, 'group_urls': JSON.stringify(urls_for_API)},
                                        //     success: function(result){
                                        //       console.log('group result');
                                        //       console.log(result);
                                        //     }
                                        //   });
                                    });


                                }
                            } else if (mesage_top_post != "") {
                                var categoryKey = $('select.e_fb_category_dropdown').val();
                                var categoryVal = $('select.e_fb_category_dropdown').text();
                                var categoryUrl = JSON.parse(localStorage.getItem('e_fb_category_urls'));
                                console.log(categoryUrl);
                                if (categoryKey != "") {
                                    categoryKey = parseInt(categoryKey);
                                    //	console.log(categoryUrl[2]);
                                    //console.log(categoryUrl[categoryKey]);
                                    //categoryUrl[parseInt(categoryKey)] = urls;
                                    //	console.log(categoryKey);
                                    localStorage.setItem('e_fb_category_urls', JSON.stringify(categoryUrl));
                                    chrome.runtime.sendMessage({
                                        method: "setgroups",
                                        catName: catName,
                                        urls_for_API: urls_for_API
                                    }, function(data) {
                                        // customer_details = JSON.parse(data.customer_details);
                                        // console.log("get customer_details");
                                        // console.log(customer_details);
                                        // $.ajax({ 
                                        //     url: 'https://burroughsmedia.com/poster_for_facebook/api/groups',
                                        //     type: 'POST',
                                        //     data: {'customer_id': customer_details.id, 'category': catName, 'group_urls': JSON.stringify(urls_for_API)},
                                        //     success: function(result){
                                        //       console.log('group result');
                                        //       console.log(result);
                                        //     }
                                        //   });
                                    });

                                }

                            }
                            if (mesage_top_post != "" && $.trim($('#e_fb_groups_url').val()) != "") {

                                localStorage.setItem('e_fb_post_urls', $('#e_fb_groups_url').val());
                                localStorage.setItem('e_fb_msg', mesage_top_post);

                                var lines = $('#e_fb_groups_url').val().split(',');
                                var urlToOpenArray = [];
                                if (lines.length > 0) {

                                    for (var i = 0; i < lines.length; i++) {
                                        var urlToOpen = $.trim(lines[i]);
                                        urlToOpen = urlToOpen.replace('www.', 'm.');
                                        if (urlToOpen != "") {
                                            if (urlToOpen.indexOf('?') > 0) {
                                                urlToOpen = urlToOpen + '&e_fb_tag=send';
                                            } else {
                                                urlToOpen = urlToOpen + '?e_fb_tag=send';
                                            }
                                            urlToOpenArray[urlToOpenArray.length] = urlToOpen;
                                        }
                                    }
                                    localStorage.setItem('e_fb_urls', JSON.stringify(urlToOpenArray));
                                    chrome.storage.local.set({
                                        e_fb_urls: JSON.stringify(urlToOpenArray),
                                        e_fb_msg: mesage_top_post
                                    }, function() {
                                        console.log('Value is set to ' + value);
                                    });

                                    chrome.runtime.sendMessage({
                                        method: "startPosting",
                                        url: $.trim(urlToOpenArray[0]),
                                        msg: mesage_top_post
                                    }, function(data) {
                                        $('.e_fb_groups_overlay').hide();
                                        $('.e_fb_popup').hide();
                                    });
                                    /*
                                    if( urlToOpenArray.length > 0 ){
                                    	window.location.replace( $.trim(urlToOpenArray[0]) );
                                    } */
                                }
                            } else {
                                alert('Please fill urls and message both fields first :)');
                            }

                        });



                    }
                }

            }
        });
    });

});




function switchToClassic() {


    $("div[aria-label='Account']").click()
    var classicInterval = setInterval(() => {
        if ($("span:contains('Switch to classic')").length > 0) {
            clearInterval(classicInterval);
            $("span:contains('Switch to classic')").click();

        }

        if ($("span:contains('Go back to the previous Facebook design at any time.')").length > 0) {

            clearInterval(classicInterval);
            $("span:contains('Go back to the previous Facebook design at any time.')").click();
        }







    }, 1200);


}


function switchToNew() {

    document.getElementById("userNavigationLabel").click();
    var newInterval = setInterval(() => {
        if ($("span:contains('Switch to new Facebook')").length > 0) {
            clearInterval(newInterval);
            $("span:contains('Switch to new Facebook')").click()
        }

    }, 1500);

}


function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

var delay = (function() {
    var timer = 0;
    return function(callback, ms) {
        //clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();


function postToGroup(groupId, userId, e_fb_msg) {
    return new Promise((res, rej) => {
        fetch("https://www.facebook.com/api/graphql/", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                "pragma": "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
            },
            "referrer": "https://www.facebook.com/groups/623072621158643",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "__req=23&__beoa=1&__pc=EXP2%3Acomet_pkg&dpr=1&__ccg=EXCELLENT&__rev=1002723970&__s=s54ts6%3Axl3h94%3A24gqmk&__hsi=6876352512267432671-0&__comet_req=1&fb_dtsg=AQH1ujU3jOSk%3AAQEK52wMKRy7&jazoest=21981&__spin_r=1002723970&__spin_b=trunk&__spin_t=1601025581&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ComposerStoryCreateMutation&variables=%7B%22input%22%3A%7B%22logging%22%3A%7B%22composer_session_id%22%3A%2226ee6052-6f39-4d8d-94a4-9fe07b4fc236%22%7D%2C%22source%22%3A%22WWW%22%2C%22attachments%22%3A%5B%5D%2C%22message%22%3A%7B%22ranges%22%3A%5B%5D%2C%22text%22%3A%22" + e_fb_msg + "%22%7D%2C%22inline_activities%22%3A%5B%5D%2C%22explicit_place_id%22%3A%220%22%2C%22tracking%22%3A%5Bnull%5D%2C%22audience%22%3A%7B%22to_id%22%3A%22" + groupId + "%22%7D%2C%22actor_id%22%3A%22" + userId + "%22%2C%22client_mutation_id%22%3A%223%22%7D%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22feedLocation%22%3A%22GROUP%22%2C%22feedbackSource%22%3A0%2C%22focusCommentID%22%3Anull%2C%22gridMediaWidth%22%3Anull%2C%22scale%22%3A1%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22group%22%2C%22useDefaultActor%22%3Afalse%2C%22isFeed%22%3Afalse%2C%22isFundraiser%22%3Afalse%2C%22isFunFactPost%22%3Afalse%2C%22isGroup%22%3Atrue%2C%22isTimeline%22%3Afalse%2C%22isLivingRoom%22%3Afalse%2C%22isSocialLearning%22%3Afalse%2C%22UFI2CommentsProvider_commentsKey%22%3A%22CometGroupDiscussionRootSuccessQuery%22%2C%22isDraftGeminiPost%22%3Afalse%7D&server_timestamps=true&doc_id=4396697503738823",
            "method": "POST",
            "mode": "cors"
        }).then((data) => {
            res(data);
        })

        fetch("https://www.facebook.com/api/graphql/", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                "pragma": "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
            },
            "referrer": "https://www.facebook.com/groups/623072621158643/?e_fb_tag=send",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "av=100002742307751&__user=100002742307751&__a=1&__dyn=7AzHK4Gg9k9wxUlg9odoyGxu4VuC0BQq2i5U4e2O14yUJu9wSAx-bwyzEeU8of8rx6axa2S3qcwJwpUe8hw8u2506QCxS320LE36xOfwwwto88hwKx-8wgolzUO0wEy1KwgEtxiV8y2G2Caw9m8wgUpxm2l2UtG7k17wc61uG329xy48aUpDwQzXxG2GVofEkxe2GewGwsoqBwJK2W5oCbwUxu8yEavxeu2u5E9824x2&__csr=jbQExDHaD9AKp7yFkhVpLKBbLjZV5ztaiUCmtzp96iSAkGFksFptFAOdz99aVagCVFAqy8kFp5jnmPxZ_Uzl5F2rQEEllkECfKHACvml1dvTiKXaV9qhFUoK4e4oF9Z5CByV6ESjExo84FojgTykaKue8WnUkUtwPjgxyp9WBhkC49sED4TDp9khCBhmq4Fajg-2dyZBBlSeu9AgpGbwZwSgrwkmZ6P7pCcoHmdODUhVhuF452km9zEiwC1m_yel1e6qgKHAGWjAF6jxyq2C3em2eufyV4eJ5h47kBxue5cKXyA6krhsm26iEEU-3mUCAp7D9wBg9oJ2JxdDmmiiQER2oapo99k8RwuawgVaCG1W87oiwJmarfyCTxzUyqqV8wm4oByQudF1l2CuiuFoS8hE98-5Uiw8O0G8GUvymaxe9w8jwQyo4iUyaGi4kdxu2678a62m6Pwzws308S319deayrotxS0Co12Ulw961KxWoE6ekMBy8B3Vo5a7FrA8h161EG4UO4E6C4U678i1Czkl21gGazVonoG0gsyG1jyAC1xAG0tV9iwqo13U2iw6IBkUC2q0RU9d1G3WQ9gcqw8x0Kg1dU0YK08qg1tU3C4zel2p4sw5LwcaQ3m&__req=1f&__beoa=1&__pc=EXP2%3Acomet_pkg&dpr=1&__ccg=GOOD&__rev=1002739500&__s=d616g1%3Acrxa7i%3Ahjoav4&__hsi=6877870626952760150-0&__comet_req=1&fb_dtsg=AQFiJazA9ZUD%3AAQHGGwllyER_&jazoest=22099&__spin_r=1002739500&__spin_b=trunk&__spin_t=1601379045&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ComposerStoryCreateMutation&variables=%7B%22input%22%3A%7B%22logging%22%3A%7B%22composer_session_id%22%3A%22432cd913-7fe5-432b-8beb-3b3d472da4e3%22%7D%2C%22source%22%3A%22WWW%22%2C%22attachments%22%3A%5B%5D%2C%22message%22%3A%7B%22ranges%22%3A%5B%5D%2C%22text%22%3A%22ignore%22%7D%2C%22inline_activities%22%3A%5B%5D%2C%22explicit_place_id%22%3A%220%22%2C%22tracking%22%3A%5Bnull%5D%2C%22audience%22%3A%7B%22to_id%22%3A%22623072621158643%22%7D%2C%22actor_id%22%3A%22100002742307751%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22feedLocation%22%3A%22GROUP%22%2C%22feedbackSource%22%3A0%2C%22focusCommentID%22%3Anull%2C%22gridMediaWidth%22%3Anull%2C%22scale%22%3A1%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22group%22%2C%22useDefaultActor%22%3Afalse%2C%22isFeed%22%3Afalse%2C%22isFundraiser%22%3Afalse%2C%22isFunFactPost%22%3Afalse%2C%22isGroup%22%3Atrue%2C%22isTimeline%22%3Afalse%2C%22isLivingRoom%22%3Afalse%2C%22isSocialLearning%22%3Afalse%2C%22UFI2CommentsProvider_commentsKey%22%3A%22CometGroupDiscussionRootSuccessQuery%22%2C%22isDraftGeminiPost%22%3Afalse%7D&server_timestamps=true&doc_id=5140853885940023&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D917556%22%5D",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

    })
}


function fireEvent(type, element, keycode) {
    var evt;

    if (document.createEvent) {
        evt = document.createEvent("HTMLEvents");
        evt.initEvent(type, true, true);
    } else {
        evt = document.createEventObject();
        evt.eventType = type;
    }

    evt.eventName = type;
    evt.keyCode = keycode;
    evt.which = keycode;

    if (document.createEvent) {
        element.dispatchEvent(evt);
    } else {
        element.fireEvent("on" + evt.eventType, evt);
    }
}