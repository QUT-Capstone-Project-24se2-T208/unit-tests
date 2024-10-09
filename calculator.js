( function( $ ) {
    $(document).ready(function(){
        // When an appliance is clicked, add it to the table
        $(".appliance-item").click(function(){
            var watt=$(this).data('wattage');
            var title=$(this).data('title');
            var hour=$(this).data('hour');
            var kwh=(watt*hour)/1000;

            var row='<tr><td class="appliance-title">'+title+'</td><td><input type="number" class="quantity" name="quantity[]" value="1" ></td><td><input type="number" class="wattage" name="wattage[]" value="'+watt+'"></td><td><input type="number" class="hours-per-day" name="hours-per-day[]" value="'+hour+'"></td><td><span class="daily-kwh">'+kwh+'</span></td><td><button class="remove-btn"><i class="fa fa-trash" aria-hidden="true"></i></button></td></tr>';
            $('table #appliance-list').append(row);
            calculateTotals();
        });

        // When the remove button is clicked, remove the corresponding row
        $('#appliance-list').on('click', '.remove-btn', function () {
            $(this).parent().parent().remove();
            calculateTotals();
        });

        // Recalculate totals when any input changes
        $('#appliance-list').on('change', 'input', function () {
            calculateTotals();
        });

        // Recalculate totals when inputs in the summary table change
        $('#summary-table').on('change', 'input', function () {
            calculateTotals();
        });

        // Recalculate totals when the select box (Simultaneous Usage Scenario) changes
        $('#simultaneous-usage').on('change', function () {
            calculateTotals();  // Call the function when a new scenario is selected
        });
    });

    // Function to calculate totals for wattage and kWh
    function calculateTotals(){
        var i=0;
        var totalWatt=0;
        var totalKWh=0;

        // Loop through each appliance row to calculate the total wattage and kWh
        $( ".quantity" ).each(function(index) {
            var quantity=$(this).val();
            var wattage=$('.wattage').eq(index).val();
            var hour=$('.hours-per-day').eq(index).val();
            var kwh=(quantity*wattage*hour)/1000;
            $('.daily-kwh').eq(index).html(kwh);
            totalWatt=parseFloat(totalWatt)+parseFloat(wattage)*quantity;
            totalKWh=totalKWh+kwh;
        });

        // Update the total load (kW) and total kWh per day in the UI
        var kw=totalWatt/1000;
        $('#total-load-kw').html(kw);
        $('#total-kwh-per-day').html(totalKWh);

        // Calculate inverter size based on the simultaneous usage percentage
        var simultaneousUsage = parseFloat($('#simultaneous-usage').val()) / 100;  // Get value from select box
        var inverterKW=(kw*simultaneousUsage);
        var solarKW=kw/parseFloat($('#sun-hours').val());
        var batteryKW=kw*parseFloat($('#reserve-days').val());

        // Determine appropriate inverter size based on inverterKW value
        var inverterText="0kVA Inverter";
        if(inverterKW<=0){
            inverterText="0kVA Inverter";
        }else if(inverterKW<3){
            inverterText="3kVA Inverter"
        }else if(inverterKW<5){
            inverterText="5kVA Inverter";
        }else if(inverterKW<8){
            inverterText="8kVA Inverter";
        }else if(inverterKW<12){
            inverterText="15kVA Inverter";
        }else if(inverterKW<16){
            inverterText="2x10kVA Inverter";
        }else if(inverterKW<23){
            inverterText="2x15kVA Inverter";
        }else{
            inverterText="0kVA Inverter";
        }
        $('#inverter-size').html(inverterText);

        // Determine the appropriate solar panel size based on solarKW
        var solarText="";
        if(solarKW>0 && solarKW<2){
            solarText="6 x 275W";
        }else if(solarKW<3){
            solarText="9 x 275W";
        }else if(solarKW<5){
            solarText="10 x 390W";
        }else if(solarKW<6){
            solarText="15 x 370W";
        }else if(solarKW<8){
            solarText="18 x 390W";
        }else if(solarKW<10){
            solarText="25 x 390W";
        }else if(solarKW<14){
            solarText="35 x 390W";
        }else if(solarKW<19){
            solarText="50 x 370W";
        }else if(solarKW>18){
            solarText="50+ ";
        }else{
            solarText="";
        }
        $('#solar-panel-size').html(solarText);

        // Determine the appropriate battery size based on batteryKW
        var batteryText="";
        if(batteryKW>50){
            batteryText="50+ kWh";
        }else if(batteryKW>40){
            batteryText="40 - 50kWh";
        }else if(batteryKW>30){
            batteryText="30 - 40kWh";
        }else if(batteryKW>25){
            batteryText="25 - 30kWh";
        }else if(batteryKW>20){
            batteryText="20 - 25kWh";
        }else if(batteryKW>15){
            batteryText="15 - 20kWh";
        }else if(batteryKW>10){
            batteryText="10 - 15kWh";
        }else if(batteryKW>7.5){
            batteryText="7.5 - 10kWh";
        }else if(batteryKW>5){
            batteryText="5 - 7.5kWh";
        }else if(batteryKW>2.5){
            batteryText="2.5 - 5kWh";
        }else if(batteryKW>0){
            batteryText="0 - 2.5kWh";
        }else{
            batteryText="0kWh";
        }
        $('#battery-capacity').html(batteryText);

        // Update active state for each appliance based on the appliance-title
        $('.appliance-item').removeClass('active');
        $('.appliance-title').each(function(){
            var title=$(this).html();
            $('.appliance-item[data-title="'+title+'"]').addClass('active');
        });
    }

} )( jQuery );

// Handle scroll behavior for section1
let lastScrollTop = 0;
let isScrolling;

document.addEventListener('scroll', function() {
    const section1 = document.getElementById('section1');
    const scrollPosition = window.scrollY;

    if (window.innerWidth >= 900) {
        if (scrollPosition > 130) {
            // Set height to 90% when scrolling is more than 130px
            section1.style.height = '93%';
        } else {
            // Set height back to 75% when scrolling back up
            section1.style.height = '75%';
        }
    } else {
        // Maintain 75% height for screens smaller than 900px
        section1.style.height = '75%';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const solutionLink = document.getElementById('solution-link');
    const subMenu = document.getElementById('solution-submenu');
    let isSubMenuOpen = false;

    // Handle click event
    solutionLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default anchor behavior
        isSubMenuOpen = !isSubMenuOpen;
        toggleSubMenu();
    });

    // Handle hover event
    solutionLink.addEventListener('mouseenter', function () {
        isSubMenuOpen = true;
        toggleSubMenu();
    });

    subMenu.addEventListener('mouseenter', function () {
        isSubMenuOpen = true;
        toggleSubMenu();
    });

    subMenu.addEventListener('mouseleave', function () {
        isSubMenuOpen = false;
        toggleSubMenu();
    });

    // Close submenu when clicking outside
    document.addEventListener('click', function (event) {
        if (!solutionLink.contains(event.target) && !subMenu.contains(event.target)) {
            isSubMenuOpen = false;
            toggleSubMenu();
        }
    });

    // Toggle submenu visibility
    function toggleSubMenu() {
        if (isSubMenuOpen) {
            subMenu.style.display = 'block';
        } else {
            subMenu.style.display = 'none';
        }
    }
});

document.getElementById('menu-toggle').addEventListener('click', function() {
    var navbar = document.querySelector('.navbar-collapse');
    navbar.classList.toggle('active');
});
