var step_cur = 1;
// var step_all = 6;
// var step_send_email = 5;
var quiz_answers = {};

(function($){
    $(document).on('click', 'a[href="#custom_quiz"]', function() {
        var header_height = $('#shopify-section-announcement').height() + $('#shopify-section-header').height();
        $('body').addClass('custom-quiz-popup');
        $('.quiz-page').addClass('loading');
        $('.quiz-page-wrap').hide();
        $('.custom-quiz').css('top',  header_height + 'px');
        $('.custom-quiz').height($(window).height() - header_height);
        $('.custom-quiz').fadeIn();
        $('.custom-quiz-close-btn').fadeIn();
        $.ajax({
            url: 'https://piper-golf-app.herokuapp.com/quiz',
            type: 'get',
            // dataType: 'json',
            success: function(resp) {
              	
                $('.quiz-page-wrap').html(resp.replace("CONTINUE", "Continue"));
                $('.quiz-page').removeClass('loading');
                $('.quiz-page-wrap').fadeIn();

                // $('.quiz-step-email .quiz-answer-list').html($('#custom_quiz_customer_form_wrap').html());
                
                step_cur = 1;
            }
        })
    })

    $(document).on('click', '.custom-quiz-close-btn', function() {
        $('body').removeClass('custom-quiz-popup');
        $('.custom-quiz').fadeOut();
        $('.custom-quiz-close-btn').hide();
    })

    function goStep(step) {
        
        $('.quiz-step').addClass('quiz-hide');
        $('.quiz-step').removeAttr('style');
        $('.quiz-step[step="' + step + '"]').fadeIn();       
       
        $('.quiz-progress-piece[step="' + step + '"]').addClass('done');

        if(step == step_all) {
            $('.quiz-step-btns').hide();
        }
        else {
            $('.quiz-step-btns').show();
        }
    }

    $(document).on('click', '.quiz-btn-next', function() {
       
        if(step_cur == step_send_email) {

            if($('#email').val() == '') {
                $('.quiz-continue-error').text('Please input email');
                $('.quiz-continue-error').show();
                return;
            }
            $('.quiz-continue-error').hide();

            $.ajax({
                url: 'https://piper-golf-app.herokuapp.com/create-customer',
                type: 'post',
                data: {
                    answers: quiz_answers,
                    email: $('#email').val()
                },
                success: function(resp) {
                }
            })

            $('.quiz-page').addClass('loading');
            $.ajax({
                url: 'https://piper-golf-app.herokuapp.com/result',
                type: 'post',
                data: {
                    answers: quiz_answers
                },
                success: function(resp) {
                    step_cur ++;
                    goStep(step_cur);
                  
                  	let rsp = resp.replaceAll("ADD TO CART", "Add to Cart");
                  	rsp = rsp.replaceAll("SUBSCRIBE", "Subscribe");
                  
                    $('.quiz-step-products').html(rsp);
                    $('.quiz-page').removeClass('loading');
                    $('.quiz-page-wrap').fadeIn();
                }
            })
        }
        else {
            var question_id = $('.quiz-step[step="' + step_cur + '"]').attr('question-id');
            if($('.quiz-step[step="' + step_cur + '"]').attr('answer-type') == 1){
                var ans_arr = [];
                $.each($("input[name='ans" + step_cur + "']:checked"), function(){
                    ans_arr.push($(this).val());
                });
    
                if(ans_arr.length == 0) {
                    $('.quiz-continue-error').text('Please answer question above');
                    $('.quiz-continue-error').show();
                    return;
                }
                else {
                    $('.quiz-continue-error').hide();
                    quiz_answers[question_id] = ans_arr;
                }
                
            }
            else {
                if($('[name="ans' + step_cur + '"].selected').length == 0) {
                    $('.quiz-continue-error').text('Please answer question above');
                    $('.quiz-continue-error').show();
                    return;
                }
                else {
                    $('.quiz-continue-error').hide();
                    quiz_answers[question_id] = $('[name="ans' + step_cur + '"].selected').attr('value');
                }
                
            }        

            step_cur ++;
            goStep(step_cur);
        }
    })

    $(document).on('click', '.quiz-btn-skip', function() {
        $('.quiz-continue-error').hide();
        if(step_cur == step_send_email) {
            $('.quiz-continue-error').hide();
            
            $('.quiz-page').addClass('loading');
            $.ajax({
                url: 'https://piper-golf-app.herokuapp.com/result',
                type: 'post',
                data: {
                    answers: quiz_answers
                },
                success: function(resp) {
                    step_cur ++;
                    goStep(step_cur);
                  
                  	let rsp = resp.replaceAll("ADD TO CART", "Add to Cart");
                  	rsp = rsp.replaceAll("SUBSCRIBE", "Subscribe");
                  
                    $('.quiz-step-products').html(rsp);
                    $('.quiz-page').removeClass('loading');
                    $('.quiz-page-wrap').fadeIn();
                }
            })
        }
        else {
            step_cur ++;
            goStep(step_cur);
        }
        
    })

    $(document).on('click', '.quiz-progress-piece.done', function() {
        step_cur = step = parseInt($(this).attr('step'));
        goStep(step_cur);
    })

    $(document).on('click', '.quiz-option-answer-wrap', function() {
        $('[step="' + step_cur + '"] .quiz-option-answer-wrap').removeClass('selected');
        $(this).addClass('selected');
    })

    $(document).on('click', '.quiz-product-add-btn', function() {
        var variant_id = $(this).parents('.quiz-product-col').attr('variant-id');
        var instance = $(this).parents('.quiz-product-col');
        $(instance).addClass('loading');
        $.ajax({
            url: window.Shopify.routes.root + 'cart/add.js',
            type: 'post',
            data: {
                items: [
                    {
                        quantity: 1,
                        id: variant_id
                    }
                ]
            },
            success: function(resp) {
                $(instance).removeClass('loading');
                $(instance).find('.msg-success-added').fadeIn();
            }
        })
    })

    $(document).on('click', '.quiz-product-subscribe-btn', function() {
        var product_url = $(this).parents('.quiz-product-col').attr('product-url');
        location.href = product_url;
    })
    
    
})(jQuery)