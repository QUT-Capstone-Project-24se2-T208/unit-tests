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
