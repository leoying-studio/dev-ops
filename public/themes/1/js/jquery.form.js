$.fn.setFormDefault = function(defaultValues) {
    this.find('input, select, textarea').each(function() {
        var elementId = $(this).attr('name');
        if(elementId in defaultValues) {
            var newValue = defaultValues[elementId];
            var tagName = $(this).prop("tagName").toLowerCase();
            if (tagName === 'input' && ($(this).attr('type') === 'radio' || $(this).attr('type') === 'checkbox')) {
                if ($(this).val() == newValue) {
                    $(this).prop('checked', true);
                }
            } else {
               
                $(this).val(newValue);
            }
        }
    });
};