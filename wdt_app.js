$(document).ready(function () {
    var thead = $('#personalTable tbody');
    var staffMembers = [];
    var deliveryBoard = $('#DeliveryTable tbody');

    // Parent class
    class Employee {
        constructor(name, lastName) {
            this.name = name;
            this.lastName = lastName;
        }
    }

    // Child class 
    class StaffMember extends Employee {
        constructor(name, lastName, email, status, inOffice) {
            super(name, lastName);
            this.email = email;
            this.status = status;
            this.inOffice = inOffice;
            this.outTime = null;
            this.duration = null;
            this.expectedReturnTime = null;
            this.remainingTime = null;
            this.picture = null;
            this.notificationShown = false;
            this.toast = null;
            this.selected = false; 
        }

        staffOut(duration) {
            this.status = "Out";
            this.inOffice = false;
            this.outTime = new Date();
            this.duration = duration;
            this.expectedReturnTime = new Date(this.outTime.getTime() + duration * 60000);
            this.remainingTime = duration * 60; // Convert minutes to seconds

            renderTable();
            this.startCountdown(); // Start countdown when staff member goes out
        }

        startCountdown() {
            var self = this;
            var countdownInterval = setInterval(function () {
                self.remainingTime--;
                if (self.remainingTime <= 0) {
                    clearInterval(countdownInterval); // Stop the countdown
                    self.staffMemberIsLate(); // Call method when late
                }
            }, 1000); // Update every second
        }

        staffMemberIsLate() {
            if (!this.notificationShown) {
                var toastContainer = $('#liveToast');
                var toastBody = toastContainer.find('.toast-body');

                var toastContent = '<div><img src="' + this.picture + '" alt="Profile Picture"></div>' +
                    '<div>' + this.name + ' ' + this.lastName + ' has not returned on time!' +
                    '<br>Expected Return Time: ' + this.expectedReturnTime.toLocaleTimeString() + '</div>';
                toastBody.html(toastContent);

                var toast = new bootstrap.Toast(toastContainer[0], {
                    animation: true,
                    autohide: false,
                    position: 'middle'
                });
                toast.show();
                this.toast = toast;
                this.notificationShown = true;
            }
        }

        staffIn() {
            this.status = "In";
            this.inOffice = true;
            this.outTime = null;
            this.duration = null;
            this.expectedReturnTime = null;
            this.remainingTime = null;
            this.notificationShown = false;
            this.clearToast();
            renderTable();
        }

        clearToast() {
            if (this.toast) {
                this.toast.hide();
                this.toast.dispose();
                this.toast = null;
            }
        }
    }

    // Child class 
    class DeliveryDriver extends Employee {
        constructor(name, lastName, vehicle, telephone, address, returnTime) {
            super(name, lastName);
            this.vehicle = vehicle;
            this.telephone = telephone;
            this.address = address;
            this.returnTime = returnTime;
            this.remainingTime = null;
            this.notificationShown = false;
            this.toast = null;
        }

        DeliveryDriverIsLate() {
            if (!this.notificationShown) {
                var toastContainer = $('#liveToast');
                var toastBody = toastContainer.find('.toast-body');
        
                var toastContent = '<div><i class="' + this.vehicle + '"></i></div>' +
                    '<div>' + this.name + ' ' + this.lastName + ' has not returned on time!' +
                    '<br>Telephone: ' + this.telephone +
                    '<br>Address: ' + this.address +
                    '<br>Estimated Return Time: ' + this.returnTime.toLocaleTimeString() + '</div>';
                toastBody.html(toastContent);
        
                var toast = new bootstrap.Toast(toastContainer[0], {
                    animation: true,
                    autohide: false,
                    position: 'middle'
                });
                toast.show();
                this.toast = toast;
                this.notificationShown = true;
            }
        }        

        startCountdown() {
            var self = this;
            var countdownInterval = setInterval(function () {
                var currentTime = new Date();
                var timeDiff = self.returnTime - currentTime;
                self.remainingTime = Math.ceil(timeDiff / 1000); 

                if (self.remainingTime <= 0) {
                    clearInterval(countdownInterval); // Stop the countdown
                    self.DeliveryDriverIsLate(); // Call method when late
                }
            }, 1000); // Update every second
        }
    }

    // Function to retrieve staff members
    function staffUserGet() {
        for (var i = 0; i < 5; i++) {
            $.ajax({
                url: 'https://randomuser.me/api/',
                dataType: 'json',
                success: function (data) {
                    var user = data.results[0];
                    var staffMember = new StaffMember(
                        user.name.first,
                        user.name.last,
                        user.email,
                        "In",
                        true
                    );
                    staffMember.picture = user.picture.thumbnail;
                    staffMembers.push(staffMember);
                    if (staffMembers.length === 5) {
                        renderTable();
                    }
                }
            });
        }
    }

    // Function to render the table with staff members
    function renderTable() {
        thead.empty();
        staffMembers.forEach(function (member, index) {
            var row = $('<tr>');

            row.append('<td>' + (member.picture ? '<img src="' + member.picture + '" alt="Profile Picture">' : '') + '</td>' +
                '<td>' + member.name + '</td>' +
                '<td>' + member.lastName + '</td>' +
                '<td>' + member.email + '</td>' +
                '<td>' + member.status + '</td>' +
                '<td>' + (member.outTime ? member.outTime.toLocaleTimeString() : '') + '</td>' +
                '<td>' + (member.duration ? (Math.floor(member.duration / 60) + 'h ' + member.duration % 60 + 'm') : '') + '</td>' +
                '<td>' + (member.expectedReturnTime ? member.expectedReturnTime.toLocaleTimeString() : '') + '</td>');

            row.click(function () {
                // Clear previous selections
                staffMembers.forEach(function (member) {
                    member.selected = false;
                });

                // Select current member
                member.selected = true;
                $('.selected').removeClass('selected');
                $(this).addClass('selected');
            });

            thead.append(row);
        });
    }

    // Click event handler for the "Out" button
    $('#outbutton').click(function () {
        var selectedMember = staffMembers.find(member => member.selected);
        if (selectedMember) {
            var duration = parseInt(prompt("Enter the duration of absence in minutes for " + selectedMember.name + " " + selectedMember.lastName + ":"));
            if (!isNaN(duration) && duration > 0) {
                selectedMember.staffOut(duration);
            } else {
                alert("Invalid duration. Please enter a valid duration in minutes.");
            }
        } else {
            alert("No staff member selected. Please select a staff member.");
        }
    });

    // Click event handler for the "In" button
    $('#inbutton').click(function () {
        var selectedMember = staffMembers.find(member => member.selected);
        if (selectedMember) {
            selectedMember.staffIn();
        } else {
            alert("No staff member selected. Please select a staff member.");
        }
    });

    // Retrieve staff members
    staffUserGet();

    // Initial call to digitalClock
    digitalClock();

    // Set interval to update digitalClock every second
    setInterval(digitalClock, 1000); // Update every second

    // Function to add a delivery to the Delivery Board table
    function addDelivery(vehicle, name, surname, telephone, address, returnTime) {
        var newRow = $('<tr>');
        newRow.append('<td><i class="' + vehicle + '"></i></td>');
        newRow.append('<td>' + name + '</td>');
        newRow.append('<td>' + surname + '</td>');
        newRow.append('<td>' + telephone + '</td>');
        newRow.append('<td>' + address + '</td>');
        newRow.append('<td>' + returnTime.toLocaleTimeString() + '</td>'); // Display return time

        // Append the new row to the delivery board
        deliveryBoard.append(newRow);

        // Start countdown for delivery driver
        var deliveryDriver = new DeliveryDriver(name, surname, vehicle, telephone, address, returnTime);
        deliveryDriver.startCountdown();

        // Reset input fields after adding the delivery
        resetInputFields();
    }

    // Click event handler for the "Clear" button in the delivery board
$('#ClearButton').click(function () {
    var selectedRow = $('#DeliveryTable tbody tr.selected');
    if (selectedRow.length > 0) {
        var confirmation = confirm("Are you sure you want to remove the selected delivery?");
        if (confirmation) {
            selectedRow.remove();
        }
    } else {
        alert("Please select a delivery to remove.");
    }
});


    // Click event handler for rows in the delivery board table
    deliveryBoard.on('click', 'tr', function () {
        // Remove previous selection
        deliveryBoard.find('tr').removeClass('selected');

        // Mark the clicked row as selected
        $(this).addClass('selected');
    });

    // Initialize the vehicle dropdown with car and bicycle icons
    function initializeVehicleDropdown() {
        var dropdown = $('#vehicleDropdown ul');
        dropdown.empty();

        // Append car icon
        dropdown.append('<a class="dropdown-item" href="#" data-value="bi bi-car-front-fill"><i class="bi bi-car-front-fill"></i> Car</a>');

        // Append bicycle icon
        dropdown.append('<a class="dropdown-item" href="#" data-value="bi bi-bicycle"><i class="bi bi-bicycle"></i> Bicycle</a>');

        // Click event handler for dropdown items
        dropdown.find('.dropdown-item').click(function (e) {
            e.preventDefault(); 

            // Set the selected vehicle icon
            var vehicleIcon = $(this).data('value');
            $('#selectedVehicle').val(vehicleIcon);
        });
    }

    // Initialize the vehicle dropdown
    initializeVehicleDropdown();

    // Function to update digital clock and check late status periodically
    function digitalClock() {
        let currentTime = new Date();
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let monthName = months[currentTime.getMonth()];

        let hours = currentTime.getHours();
        let minutes = currentTime.getMinutes();
        let seconds = currentTime.getSeconds();

        let currentDateTimeString =
            "Date " + currentTime.getDate() + " " + monthName + " " + currentTime.getFullYear() + " Time: " +
            (hours < 10 ? '0' : '') + hours + ":" + (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;

        document.getElementById("time").innerHTML = currentDateTimeString;
    }

    // Set interval to update digital clock every second
    setInterval(digitalClock, 1000); // Update every second

    // Click event handler for the "Add" button
    $('#AddButton').click(function () {
        validateDelivery();
    });

    // Function to validate delivery input and add to the delivery board
    function validateDelivery() {
        var vehicle = $('#selectedVehicle').val(); // Get the value of the selected option
        var name = $('#nameInput').val().trim();
        var surname = $('#surnameInput').val().trim();
        var telephone = $('#telephoneInput').val().trim();
        var address = $('#addressInput').val().trim();
        var returnTimeInput = $('#ReturnTimeInput').val(); // Get the return time input value

        // Validate input fields
        if (vehicle === "bi bi-car-front-fill" || vehicle === "bi bi-bicycle") {
            if (name && /^[a-zA-Z]+$/.test(name) && surname && /^[a-zA-Z]+$/.test(surname) && /^\d{7,}$/.test(telephone) && address && returnTimeInput) {
                var returnTimeParts = returnTimeInput.split(':');
                var returnTime = new Date();
                returnTime.setHours(parseInt(returnTimeParts[0]));
                returnTime.setMinutes(parseInt(returnTimeParts[1]));

                addDelivery(vehicle, name, surname, telephone, address, returnTime); // Add the delivery
                resetInputFields(); // Reset input fields after adding the delivery
            } else {
                if (!name || !surname || !address || !returnTimeInput) {
                    alert('Please fill in all fields.');
                } else if (!/^[a-zA-Z]+$/.test(name) || !/^[a-zA-Z]+$/.test(surname)) {
                    alert('Name and surname should only contain letters.');
                } else if (!/^\d{7,}$/.test(telephone)) {
                    alert('Telephone should contain at least 7 digits.');
                }
            }
        } else {
            alert('Please select either a car or a bicycle.');
        }
    }

    // Function to reset input fields
    function resetInputFields() {
        $('#nameInput').val('');
        $('#surnameInput').val('');
        $('#telephoneInput').val('');
        $('#addressInput').val('');
        $('#ReturnTimeInput').val('');
        $('#selectedVehicle').val('');
    }
});