// ==========================================
// CONFIGURATION
// ==========================================
// REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const API_URL = "https://script.google.com/macros/s/AKfycbw5LkHC9Z6pVjS-UvNzfylqOTbcNZQnXGWZz9LznSZPedAsJOMYzDmjN2NofPtEGmv9sA/exec"; 

// ==========================================
// NAVIGATION LOGIC
// ==========================================
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active-section'));
    // Remove active class from nav buttons
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active-section');
    document.getElementById('nav-' + sectionId).classList.add('active');

    // Trigger data fetch based on section
    if(sectionId === 'booking') {
    fetchBookings();
    fetchAllSlots();
}
    if(sectionId === 'sponsors') fetchSponsors();
    if(sectionId === 'wishes') fetchWishes();
    if(sectionId === 'donate') fetchDonationsTotal();
}

// ==========================================
// COUNTDOWN TIMER LOGIC
// ==========================================
function startCountdown() {
    // Assuming Ganesh Chaturthi 2026 is around Sept 14, 2026
    const targetDate = new Date("September 14, 2026 00:00:00").getTime();

    setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById("countdown").innerHTML = "Ganpati Bappa Morya!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById("countdown").innerHTML = 
            `${days} Days | ${hours} Hrs | ${minutes} Mins left`;
    }, 1000);
}

// ==========================================
// POPULATE DROPDOWNS
// ==========================================
function populateDays() {
    const daySelect = document.getElementById('b-day');
    for(let i=1; i<=11; i++) {
        let option = document.createElement('option');
        option.value = `Day ${i}`;
        option.text = `Day ${i}`;
        daySelect.appendChild(option);
    }
}

// ==========================================
// API CALLS (FETCH)
// ==========================================

// 1. Fetch Bookings
async function fetchBookings() {
    const list = document.getElementById('bookings-list');
    list.innerHTML = "Loading bookings...";
    try {
        const res = await fetch(`${API_URL}?action=getBookings`);
        const json = await res.json();
        if(json.status === "Success") {
            list.innerHTML = "";
            if(json.data.length === 0) {
                list.innerHTML = "<p>No bookings yet. Be the first!</p>";
                return;
            }
            json.data.forEach(b => {
                list.innerHTML += `
                    <div class="list-item">
                        <strong>${b.day} - ${b.slot}</strong>
                        <span>Booked by: ${b.name}</span>
                    </div>`;
            });
        }
    } catch(err) {
        list.innerHTML = "Failed to load bookings.";
    }
}

// 2. Submit Booking
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('booking-msg');
    const btn = e.target.querySelector('button');
    
    const payload = {
        action: "createBooking",
        name: document.getElementById('b-name').value,
        phone: document.getElementById('b-phone').value,
        day: document.getElementById('b-day').value,
        slot: document.getElementById('b-slot').value
    };

    msg.style.color = "var(--text-dark)";
    msg.innerText = "Processing...";
    btn.disabled = true;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        
        if(json.status === "Success") {
            msg.style.color = "green";
            msg.innerText = "Booking Confirmed!";
            e.target.reset();
            fetchBookings(); // Refresh list
        } else {
            msg.style.color = "red";
            msg.innerText = json.message;
        }
    } catch(err) {
        msg.style.color = "red";
        msg.innerText = "Network error. Try again.";
    }
    btn.disabled = false;
});

// 3. Fetch Sponsors
async function fetchSponsors() {
    const list = document.getElementById('sponsors-list');
    list.innerHTML = "Loading sponsors...";
    try {
        const res = await fetch(`${API_URL}?action=getSponsors`);
        const json = await res.json();
        if(json.status === "Success") {
            list.innerHTML = "";
            if(json.data.length === 0) {
                list.innerHTML = "<p>No sponsors yet.</p>";
                return;
            }
            json.data.forEach(s => {
                list.innerHTML += `
                    <div class="list-item">
                        <strong>${s.sponsor}</strong>
                        <span>${s.day} - ${s.slot}</span>
                    </div>`;
            });
            // Update today's sponsor on home screen (just picking the first one for demo)
            if(json.data.length > 0) {
                document.getElementById('today-sponsor-name').innerText = json.data[0].sponsor;
            }
        }
    } catch(err) {
        list.innerHTML = "Failed to load sponsors.";
    }
}
async function fetchDonationsTotal() {

    try {

        const res = await fetch(`${API_URL}?action=getDonations`);
        const json = await res.json();

        let total = 0;

        json.data.forEach(d => {
            total += Number(d.amount);
        });

        document.getElementById('total-donations').innerText =
            `₹${total}`;

    } catch(err) {

        document.getElementById('total-donations').innerText =
            "Error";

    }
}

// 4. Fetch Wishes
async function fetchWishes() {
    const list = document.getElementById('wishes-list');
    list.innerHTML = "Loading wishes...";
    try {
        const res = await fetch(`${API_URL}?action=getApprovedWishes`);
        const json = await res.json();
        if(json.status === "Success") {
            list.innerHTML = "";
            if(json.data.length === 0) {
                list.innerHTML = "<p>No wishes yet.</p>";
                return;
            }
            json.data.forEach(w => {
                list.innerHTML += `
                    <div class="list-item">
                        <strong>${w.name}</strong>
                        <span>"${w.message}"</span>
                    </div>`;
            });
        }
    } catch(err) {
        list.innerHTML = "Failed to load wishes.";
    }
}

// 5. Submit Wish
document.getElementById('wishForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('wish-msg');
    const btn = e.target.querySelector('button');
    
    const payload = {
        action: "addWish",
        name: document.getElementById('w-name').value,
        message: document.getElementById('w-message').value
    };

    msg.style.color = "var(--text-dark)";
    msg.innerText = "Submitting...";
    btn.disabled = true;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        
        if(json.status === "Success") {
            msg.style.color = "green";
            msg.innerText = "Wish submitted! Waiting for approval.";
            e.target.reset();
        } else {
            msg.style.color = "red";
            msg.innerText = json.message;
        }
    } catch(err) {
        msg.style.color = "red";
        msg.innerText = "Network error. Try again.";
    }
    btn.disabled = false;
});

// ==========================================
// WHATSAPP SHARE
// ==========================================
function setupWhatsAppShare() {
    const message = encodeURIComponent("Join us for TEAM RUDRA Ganesh Chaturthi 2026! Book your pooja slot and seek blessings. Visit our portal now!");
    const currentUrl = encodeURIComponent(window.location.href);
    document.getElementById('whatsapp-share').href = `https://wa.me/?text=${message}%20${currentUrl}`;
}

// ==========================================
// INITIALIZE
// ==========================================
async function fetchAllSlots() {

    const container = document.getElementById('all-slots-list');

    try {

        const res = await fetch(`${API_URL}?action=getBookings`);
        const json = await res.json();

        let html = '';

        for(let day = 1; day <= 11; day++) {

            ['Morning','Evening'].forEach(slot => {

                const booking = json.data.find(
                    b => b.day === `Day ${day}` && b.slot === slot
                );

                if(booking){

                    html += `
                    <div class="list-item">
                        🔴 <strong>Day ${day} - ${slot}</strong>
                        <span>Booked by: ${booking.name}</span>
                    </div>
                    `;

                } else {

                    html += `
                    <div class="list-item">
                        🟢 <strong>Day ${day} - ${slot}</strong>
                        <span>Available</span>
                    </div>
                    `;

                }
            });
        }

        container.innerHTML = html;

    } catch(err) {

        container.innerHTML = "Failed to load slots";

    }
}
window.onload = () => {
    startCountdown();
    populateDays();
    setupWhatsAppShare();
    // Fetch initial data for home screen
    fetchSponsors(); 
};