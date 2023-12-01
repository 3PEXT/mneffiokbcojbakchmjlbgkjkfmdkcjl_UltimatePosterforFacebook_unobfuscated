$(document).ready(function() {

    function customer_details_1() {
        return new Promise((resolve, reject) => {

            $('body').css('height', '200px');
            $('html').css('height', '200px');
            $('.panel-details').show();
            $('.panel-login').hide();
            customer_details = JSON.parse(localStorage.getItem('customer_details'));
            console.log(customer_details.id);

            $.ajax({
                url: 'https://burroughsmedia.com/poster_for_facebook/api/customer-verification/' + customer_details.id,
                type: 'GET',
                success: function(res) {
                    res = JSON.parse(res);
                    var message = res.msg;
                    console.log(res);
                    var isTrialActive = false;
                    if (res.success) {
                        $('body').find('.group_details').html('<div class="group_details_row"><div class="start_free_trial_container">' + res.msg + '</div></div>');
                        isTrialActive = true;
                    } else {
                        if (res.msg == "Your trial start date is empty") {
                            $('body').find('.group_details').html('<div class="group_details_row"><div class="start_free_trial_container"><button id="start_free_trial" data-customer_id="' + customer_details.id + '">Start Free Trial</button></div></div>');
                        } else if (message.includes("Your trial has expired !Please purchase your plan")) {
                            $('body').find('.group_details').html('<div class="group_details_row"><div class="start_free_trial_container">' + message + '</div></div>');
                        } else {
                            $('body').find('.group_details').html('<div class="group_details_row"><div class="start_free_trial_container">' + message + '</div></div>');
                        }
                    }
                    initTrialEvent();
                    resolve(isTrialActive);
                }
            });
        })


    }

    function initTrialEvent() {

        $('body').on('click', '#start_free_trial', function() {
            $.ajax({
                url: 'https://burroughsmedia.com/poster_for_facebook/api/strat-trial/' + customer_details.id + '?package_id=2',
                type: 'GET',
                success: function(res) {
                    var customer_details = JSON.parse(localStorage.getItem('customer_details'));
                    var start_date = new Date();
                    var date = start_date.getFullYear() + "-" + (start_date.getMonth() + 1) + "-" + start_date.getDate() + " " + start_date.getHours() + ":" + start_date.getMinutes() + ":" + start_date.getSeconds();
                    customer_details['start_date'] = date;

                    localStorage.setItem('customer_details', JSON.stringify(customer_details));

                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, function(tabs) {
                        for (var i = 0; i < tabs.length; i++) {
                            console.log(customer_details);
                            chrome.tabs.sendMessage(tabs[i].id, {
                                'action': JSON.stringify(customer_details)
                            });
                        }
                    });
                    $('body').find('.group_details').html('<div class="group_details_row"><div class="start_free_trial_container">Your free trial has been started!</div></div>');
                    console.log(res);
                }
            });
        });
    }

    var customer_details = localStorage.getItem('customer_details');
    if (customer_details) {
        customer_details_1();
        $("#logout").show();
    } else {
        $('body').css('height', '400px');
        $('html').css('height', '400px');
        $('.panel-login').show();
        $('.panel-details').hide();

        /* Tab switching in popup */
        $('#login-form-link').click(function(e) {
            $("#login-form").delay(100).fadeIn(100);
            $("#forgot-password-form").fadeOut(100);
            $("#register-form").fadeOut(100);
            $('#register-form-link').removeClass('active');
            $(this).addClass('active');
            e.preventDefault();
        });

        $('#register-form-link').click(function(e) {
            $("#register-form").delay(100).fadeIn(100);
            $("#forgot-password-form").fadeOut(100);
            $("#login-form").fadeOut(100);
            $('#login-form-link').removeClass('active');
            $(this).addClass('active');
            e.preventDefault();
        });

        $('#forgot_pass_link').click(function(e) {
            $("#forgot-password-form").delay(100).fadeIn(100);
            $("#login-form").fadeOut(100);
        });

        $('#forgot-close').click(function(e) {
            $("#login-form").delay(100).fadeIn(100);
            $("#forgot-password-form").fadeOut(100);
            e.preventDefault();
        });

        $('#forgot-password-form').submit(function(e) {
            e.preventDefault();
            $.post({
                url: "https://burroughsmedia.com/poster_for_facebook/api/forgot-password",
                data: {
                    'email': $('#forgot-email').val()
                },
                success: function(result) {
                    result = JSON.parse(result);
                    if (result.success) {
                        $('.notification').removeClass('red');
                        $('.notification').addClass('green');
                        $('.notification').html(result.msg);
                    } else {
                        $('.notification').removeClass('green');
                        $('.notification').addClass('red');
                        $('.notification').html(result.msg);
                    }
                }
            });
        })


        /* Login form submit */
        $('#login-form').submit(function(e) {
            e.preventDefault();
            var email = $('#login-form #email').val();
            var password = $('#login-form #password').val();
            if (email == '') {
                $('.notification').addClass('red');
                $('.notification').html('Please enter your email address!');
            } else if (fullName == '') {
                $('.notification').addClass('red');
                $('.notification').html('Please enter your full name!');
            } else {
                $.post({
                    url: "https://burroughsmedia.com/poster_for_facebook/api/customer-login",
                    data: {
                        'email': email,
                        'password': password
                    },
                    success: function(result) {
                        result = JSON.parse(result);
                        if (result.success) {
                            $('.notification').removeClass('red');
                            $('.notification').addClass('green');
                            $('.notification').html(result.msg);
                            chrome.tabs.query({
                                active: true,
                                currentWindow: true
                            }, function(tabs) {
                                for (var i = 0; i < tabs.length; i++) {
                                    chrome.tabs.sendMessage(tabs[i].id, {
                                        'action': JSON.stringify(result.result)
                                    });
                                }
                            });
                            (async () => {
                                localStorage.setItem('customer_details', JSON.stringify(result.result));
                                var trial = await customer_details_1();
                                $("#logout").show();
                                //window.open('https://burroughsmedia.com/poster_for_facebook/#packages', '_blank');
                            })();
                        } else {
                            $('.notification').removeClass('green');
                            $('.notification').addClass('red');
                            $('.notification').html(result.msg);
                        }
                    }
                });
            }

        });


        /* Signup form submit */
        $('#register-form').submit(function(e) {
            e.preventDefault();
            var fullName = $('#register-form #fullName').val();
            var email = $('#register-form #email').val();
            var password = $('#register-form #password').val();
            var confirm_password = $('#register-form #confirm-password').val();
            if (email == '') {
                $('.notification').removeClass('green');
                $('.notification').addClass('red');
                $('.notification').html('Please enter your email address!');
            } else if (fullName == '') {
                $('.notification').removeClass('green');
                $('.notification').addClass('red');
                $('.notification').html('Please enter your full name!');
            } else if (password == confirm_password) {
                $.post({
                    url: "https://burroughsmedia.com/poster_for_facebook/api/signup",
                    data: {
                        'email': email,
                        'fullName': fullName,
                        'password': password,
                        'conf_password': confirm_password
                    },
                    success: function(result) {
                        result = JSON.parse(result);
                        if (result.success) {
                            $('.notification').addClass('green');
                            $('.notification').html(result.msg);
                        } else {
                            $('.notification').addClass('red');
                            $('.notification').html(result.msg);
                        }
                    }
                });
            } else {
                $('.notification').addClass('red');
                $('.notification').html('Password does not match!');
            }

        });
    }
    $("#logout").on("click", function() {


        var lastUserId = JSON.parse(localStorage.getItem('customer_details')).id
        localStorage.removeItem("customer_details");

        if (localStorage.getItem("lastUserId") == null) {
            localStorage.setItem("lastUserId", lastUserId);
        }

        $("#logout").hide();
        $('body').css('height', '400px');
        $('html').css('height', '400px');
        $('.notification').addClass('green');
        $('.notification').html("Logged Out successfully!");
        $('.panel-login').show();
        $('.panel-details').hide();
        location.reload();
    });
});