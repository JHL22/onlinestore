$(function() {

    Stripe.setPublishableKey('pk_test_syMLOaa2tBm4D0N69DAznG7H');

    var opts = {
      lines: 13 // The number of lines to draw
      , length: 28 // The length of each line
      , width: 14 // The line thickness
      , radius: 42 // The radius of the inner circle
      , scale: 1 // Scales overall size of the spinner
      , corners: 1 // Corner roundness (0..1)
      , color: '#000' // #rgb or #rrggbb or array of colors
      , opacity: 0.25 // Opacity of the lines
      , rotate: 0 // The rotation offset
      , direction: 1 // 1: clockwise, -1: counterclockwise
      , speed: 1 // Rounds per second
      , trail: 60 // Afterglow percentage
      , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
      , zIndex: 2e9 // The z-index (defaults to 2000000000)
      , className: 'spinner' // The CSS class to assign to the spinner
      , top: '50%' // Top position relative to parent
      , left: '50%' // Left position relative to parent
      , shadow: false // Whether to render a shadow
      , hwaccel: false // Whether to use hardware acceleration
      , position: 'absolute' // Element positioning
    }

    $(document).on('click', '#plus', function(e){
        e.preventDefault();
        var priceValue = parseFloat($('#priceValue').val());
        var quantity = parseInt($('#quantity').val());

        priceValue += parseFloat($('#priceHidden').val());
        quantity += 1;


        $('#quantity').val(quantity);  // change hidden quantity to new quantity
        $('#priceValue').val(priceValue.toFixed(2)); // change product price to new price
        $('#total').html(quantity);  //  update current quantity shown to the user

    });

    $(document).on('click', '#minus', function(e){
        e.preventDefault();
        var priceValue = parseFloat($('#priceValue').val());
        var quantity = parseInt($('#quantity').val());

        if (quantity == 1) {
            priceValue = $('#priceHidden').val(); // if Quantity is 1 value is original price
            quantity = 1;

        } else {
            priceValue -= parseFloat($('#priceHidden').val());
            quantity -= 1;
        }

        $('#quantity').val(quantity);
        $('#priceValue').val(priceValue.toFixed(2));
        $('#total').html(quantity);

    });

    function stripeResponseHandler(status, response) {
        // Grab the form:
        var $form = $('#payment-form');

        if (response.error) { // Problem!

            // Show the errors on the form:
            $form.find('.payment-errors').text(response.error.message);
            // $form.find('.submit').prop('disabled', false); // Re-enable submission
            $form.find('button').prop('disabled', false); // Re-enable submission

        } else { // Token was created!

            // Get the token ID: response contains id and card, which contains additional card details
            var token = response.id;

            // Insert the token ID into the form so it gets submitted to the server:
            $form.append($('<input type="hidden" name="stripeToken" />').val(token));


            var spinner = new Spinner(opts).spin();
            $('#loading').append(spinner.el);

            // Submit the form:
            $form.get(0).submit();
        }
    };

    $('#payment-form').submit(function(event){
    var $form = $(this);
    // var $form = $('#payment-form');
    // $form.submit(function(event) {
        // Disable the submit button to prevent repeated clicks:
        // $form.find('.submit').prop('disabled', true);
        $form.find('button').prop('disabled', true);

        // Request a token from Stripe:
        Stripe.card.createToken($form, stripeResponseHandler);

        // Prevent the form from being submitted with the default action
        return false;
    });



});
