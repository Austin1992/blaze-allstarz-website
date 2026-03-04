function initiateGreeting() {
        const display = document.getElementById('slogan-display');
        const prompt = document.getElementById('greeting-prompt');
        
        // Visual feedback for the response
        display.style.color = '#e62222';
        display.style.fontSize = '1.5rem';
        display.style.fontWeight = 'bold';
        display.innerHTML = "BE YOUR BROTHERS KEEPER";
        
        prompt.innerHTML = "The Response:";
        prompt.style.color = "#888";

        // Reset after 4 seconds so others can "greet" again
        setTimeout(() => {
            display.innerHTML = '"BLAZE ALLSTARS!!"';
            display.style.color = 'white';
            display.style.fontSize = '1.2rem';
            prompt.innerHTML = "Tap to Greet a Teammate";
            prompt.style.color = "white";
        }, 4000);
    }



    // EVENTS PAGE - GALLERY INTERACTIONS 

   // Blaze All Stars - Event Logic
 document.addEventListener('DOMContentLoaded', () => {
    
    // Set Target Date (example: 20 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 20);

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        // Calculations
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        // Update DOM
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minsEl = document.getElementById('minutes');

        if (daysEl) {
            daysEl.innerText = d.toString().padStart(2, '0');
            hoursEl.innerText = h.toString().padStart(2, '0');
            minsEl.innerText = m.toString().padStart(2, '0');
        }

        if (difference < 0) {
            document.getElementById('countdown-timer').innerHTML = "<h3>IT'S MATCH DAY!</h3>";
        }
    };

    // Run every minute (seconds not needed for clean UI, but can be added)
    setInterval(updateCountdown, 1000);
    updateCountdown();
});




// Function to highlight active page in Navbar
function setActivePage() {
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Check if the link href matches the current filename
        if (currentPath === linkPath) {
            link.classList.add('active');
        }
        
        // Handle the 'Home' case if path is empty (root directory)
        if (currentPath === "" && linkPath === "index.html") {
            link.classList.add('active');
        }
    });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setActivePage();
    // ... your existing countdown logic ...
});


  // Initialize the Vault from Browser Storage
 // 1. Start with an empty array
let activityVault = [];

// 2. The NEW way: Fetch from the Global JSON file
async function loadVault() {
    try {
        // This pulls the data you pushed to GitHub/Netlify
        const response = await fetch('vault.json');
        const globalData = await response.json();
        
        // This pulls any "temporary" items you added via Admin on THIS device
        const localData = JSON.parse(localStorage.getItem('blazeVault')) || [];
        
        // Combine them (Local edits show up first)
        activityVault = [...localData, ...globalData];

        // 3. Kickstart the visuals
        renderActivities();
        syncHomepageShowcase();
        
    } catch (error) {
        console.error("Error loading vault.json. Make sure the file exists!", error);
        // Fallback to just local storage if the file fetch fails
        activityVault = JSON.parse(localStorage.getItem('blazeVault')) || [];
        renderActivities();
    }
}

// Call the function to start the app
loadVault();

// 1. PUBLISH WITH DATE & FEATURE TOGGLE
function publishContent() {
    const url = document.getElementById('imgUrl').value; 
    const title = document.getElementById('imgTitle').value;
    const desc = document.getElementById('imgDesc').value;
    const date = document.getElementById('eventDate').value; // Get Date
    const isFeatured = document.getElementById('featureOnHome').checked;

    if(url && title && date) {
        const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.mov');
        
        const newItem = { 
            id: Date.now(), 
            title: title, 
            url: url, 
            desc: desc,
            date: date, // Store Date
            type: isVideo ? 'video' : 'image',
            featured: isFeatured 
        };
        
        activityVault.push(newItem);
        
        // SORT CHRONOLOGICALLY (Newest Date First)
        activityVault.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        localStorage.setItem('blazeVault', JSON.stringify(activityVault));
        
        alert("Activity Recorded Successfully!");
        location.reload(); 
    } else {
        alert("Please fill in the Title, Date, and File Path.");
    }
}

// 2. RENDER ACTIVITIES (With "Live" Star Badge)
function renderActivities() {
    const container = document.getElementById('activitiesVault');
    if (!container) return;

    container.innerHTML = activityVault.map(item => {
        const isVideo = item.type === 'video';
        
        // STAR ICON FOR FEATURED CONTENT
        const liveBadge = item.featured 
            ? `<div class="live-badge" title="Live on Homepage">★ LIVE</div>` 
            : '';

        return `
            <div class="activity-card ${item.featured ? 'featured-border' : ''}">
                <div class="media-wrapper">
                    ${liveBadge}
                    ${isVideo ? `<video src="${item.url}" controls></video>` : `<img src="${item.url}" class="activity-media">`}
                </div>
                <div class="activity-details">
                    <span class="activity-date">${item.date}</span>
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                    <button onclick="deleteActivity(${item.id})" class="admin-delete-btn">Remove</button>
                </div>
            </div>`;
    }).join('');
}

// 3. HOMEPAGE SYNC (Stays the same, pulling only featured)
function syncHomepageShowcase() {
    const homeShowcase = document.getElementById('homeShowcase');
    if (!homeShowcase) return;
    const featuredItems = activityVault.filter(item => item.featured === true);
    homeShowcase.innerHTML = featuredItems.slice(0, 3).map(item => `
        <div class="showcase-card">
            <div class="media-container">
                <img src="${item.url}" class="showcase-img">
                <div class="showcase-overlay">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                </div>
            </div>
        </div>`).join('');
}

renderActivities();
syncHomepageShowcase();





// 4. DELETE FUNCTION
function deleteActivity(id) {
    if(confirm("Permanently delete this activity?")) {
        activityVault = activityVault.filter(item => item.id !== id);
        localStorage.setItem('blazeVault', JSON.stringify(activityVault));
        location.reload();
    }
}

// Run the render function on page load
renderActivities();


// Press 'P' for Password
window.onkeydown = function(e) {
    if (e.key === 'p' || e.key === 'P') {
        const pass = prompt("Enter Admin Access Code:");
        if (pass === "Blaze2026") { // Change this to your preferred password
            document.getElementById('adminPanel').style.display = 'block';
            renderAdminTools(); // Refresh the delete list
            alert("Welcome, Admin.");
        } else {
            alert("Access Denied.");
        }
    }
};



// Function to sync Homepage Showcase with Admin Uploads
function syncHomepageShowcase() {
    const homeShowcase = document.getElementById('homeShowcase');
    if (!homeShowcase) return; // Exit if not on homepage

    // Grab the same data the admin just uploaded
    const activityVault = JSON.parse(localStorage.getItem('blazeVault')) || [];

    // If empty, show some premium placeholders
    if (activityVault.length === 0) {
        return; // Keeps your static HTML images as fallback
    }

    // Clear static images and show the LATEST 3 from Admin
    homeShowcase.innerHTML = '';

    activityVault.slice(0, 3).forEach(item => {
        homeShowcase.innerHTML += `
            <div class="showcase-card">
                <div class="media-container">
                    <img src="${item.url}" alt="${item.title}" class="showcase-img">
                    <div class="showcase-overlay">
                        <h3>${item.title}</h3>
                        <p>${item.desc}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

// Fire this on every page load
syncHomepageShowcase();

//handle the mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents click from bubbling
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu if user clicks anywhere else on the screen
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
});



//contact page - form validation and submission logic
document.addEventListener('DOMContentLoaded', () => {
    const pledgeChecks = document.querySelectorAll('.pledge-check');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('membershipForm');

    // Function to check if all pledges are checked
    const checkPledges = () => {
        const allChecked = Array.from(pledgeChecks).every(checkbox => checkbox.checked);
        if (allChecked) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('submit-disabled');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('submit-disabled');
        }
    };

    // Attach listener to each checkbox
    pledgeChecks.forEach(check => {
        check.addEventListener('change', checkPledges);
    });

    // Handle Form Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Application Sent! Welcome to the potential ranks of the All Stars. Be Your Brother's Keeper!");
            form.reset();
            checkPledges(); // Re-lock the button
        });
    }
});


//about page - dynamically generate executive cards
document.addEventListener('DOMContentLoaded', () => {
    const executiveGrid = document.getElementById('executiveGrid');

    // 1. The Data: Simply add your 14+ names here

   
});


const executives = [
    { 
        name: "Edo Christopher Osazee", 
        title: "Chairman", 
        image: "images/chairman.jpg" // <-- Replace with your real filename
    },
    { 
        name: "Agwenede Peter Uwudia", 
        title: "Vice Chairman", 
        image: "" 
    },
    { 
        name: "Okonkwo Chigosim Stanley", 
        title: "Secretary General", 
        image: "images/General-Sec.jpg" 
    },
    // ... Repeat for all 14 members
    { 
        name: "Kenneth Okoroafor", 
        title: "Financial Secretary", 
        image: "" // Leaving this empty will keep the BAS Logo as a placeholder
    },
    { 
        name: "Kenneth Akawe", 
        title: "Welfare Officer", 
        image: "images/keneth-Akawe.jpg" 
    },
    { 
        name: "Joseph Etim Inyang", 
        title: "Public Relations Officer/Media", 
        image: "" 
    },
    { 
        name: "Kingsley Era Okojie", 
        title: "DSS/Provost", 
        image: "" 
    },
    { 
        name: "Obinna Ositadinma Anatogu", 
        title: "Asst. DSS/Provost", 
        image: "" 
    },
     { 
        name: "Akojuru Augustine Ugochukwu", 
        title: "Asst. Welfare Officer", 
        image: "images/Austin-Pablo.jpg" 
    },
    { 
        name: "Amadi Chile Saviour", 
        title: "Coach", 
        image: "" 
    },
    { 
        name: "Edoboy", 
        title: "Captain", 
        image: "" 
    },
    { 
        name: "Edobor Isreal Idiake", 
        title: "Legal Adviser", 
        image: "" 
    },
    { 
        name: "Mr Simon Romanus Akawe", 
        title: "Pioneer Chairman/Patron", 
        image: "images/bishop.jpg" 
    },
    { 
        name: "Mr Emeka Ebolem", 
        title: "Chairman Emeritus/BOT Member", 
        image: "images/Chairman-Emeritus.jpg" 
    },
     {
        name: "Mr Umoh B. Adam",
        title: "Board Of Trustee Member",
        image: "images/elder-umoh.jpg"
     },
     {
        name: "Mr Ekaette Umoren",
        title: "Board Of Trustee Member",
        image: ""
     },
     {
        name: "HC. Damisa Mike",
        title: "Board Of Trustee Member",
        image: "images/national.jpg"
     },
     {
        name: "Engr. Omidire Stephen",
        title: "Board Of Trustee Member",
        image: "images/baba-stevo.jpg"
     },
];



const executiveGrid = document.getElementById('executiveGrid');

if (executiveGrid) {
    executives.forEach(person => {
        const card = document.createElement('div');
        card.className = 'leader-card';
        
        // LOGIC: If 'person.image' is not empty, use it. Otherwise, use the BAS logo.
        const photoSrc = person.image && person.image !== "" ? person.image : 'images/Executive-De-BAS.jpg';
        
        // Assign a class for styling (Real photos need to fill the circle, logos don't)
        const imgClass = person.image ? 'profile-img' : 'placeholder-logo';

        card.innerHTML = `
            <div class="profile-pic">
                <img src="${photoSrc}" alt="${person.name}" class="${imgClass}">
            </div>
            <h3>${person.name}</h3>
            <p>${person.title}</p>
        `;
        
        executiveGrid.appendChild(card);
    });
}





//home page - showcase recent activities (images/videos)
const recentActivities = [
    {
        title: "Saturday Friendly",
        type: "video",
        url: "videos/saturday-friendly.mp4", // Replace with your video file
        desc: "Morning session at the pitch."
    },
    {
        title: "Wellness Drill",
        type: "video",
        url: "videos/wellness-drill.mp4", // Replace with your video file
        desc: "Mid-week fitness check."
    },
    {
        title: "Match Highlight",
        type: "video",
        url: "videos/lineup-clip.mp4", // If you have a video
        desc: "Final goal of the month."
    }
];

const homeShowcase = document.getElementById('homeShowcase');

if (homeShowcase) {
    // We only show the latest 3 items on the homepage to keep it premium
    recentActivities.slice(0, 3).forEach(item => {
        const activityItem = document.createElement('div');
        activityItem.className = 'showcase-card';
        
        const mediaHtml = item.type === 'video' 
            ? `<video src="${item.url}" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>`
            : `<img src="${item.url}" alt="${item.title}">`;

        activityItem.innerHTML = `
            <div class="media-container">
                ${mediaHtml}
                <div class="showcase-overlay">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                </div>
            </div>
        `;
        homeShowcase.appendChild(activityItem);
    });
}


//contact page - emailjs form submission
 document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Show a "Sending..." state on the button
    const btn = event.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Sending...';

    emailjs.sendForm('service_l32lavj', 'template_ylxh35f', this)
        .then(function() {
            alert('Message Sent Successfully! Blaze AllStarz will contact you soon.');
            event.target.reset();
            btn.innerText = originalText;
        }, function(error) {
            alert('Failed to send... please check your internet connection.');
            btn.innerText = originalText;
        });
 });


 //countdown timer
 function startGlobalCountdown() {
    const matchDate = new Date("2026-05-25T09:00:00").getTime();

    const timer = setInterval(function() {
        const now = new Date().getTime();
        const distance = matchDate - now;

        // Math for 52 days
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        // Debugging: This will show in your 'Inspect -> Console'
        console.log("Days remaining:", d);

        // Update the Event Page Box
        const eventBox = document.getElementById("countdown-timer");
        if (eventBox) {
            eventBox.innerText = `${d}d : ${h}h : ${m}m : ${s}s`;
        }

        // Update the Homepage Spans
        const daysLabel = document.getElementById("days");
        if (daysLabel) {
            daysLabel.innerText = d;
            document.getElementById("hours").innerText = h.toString().padStart(2, '0');
            document.getElementById("minutes").innerText = m.toString().padStart(2, '0');
            document.getElementById("seconds").innerText = s.toString().padStart(2, '0');
        }

        if (distance < 0) {
            clearInterval(timer);
            if(eventBox) eventBox.innerText = "MATCH DAY!";
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', startGlobalCountdown);