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

   // We can combine them into one array with a "category" field to differentiate
  const executives = [
    // 1. ELECTED EXECUTIVES 
    { 
      name: "Engr Edo Christopher", 
      title: "President/Chairman", 
      image: "images/chairman.jpg", 
      category: "elected" 
    },
    { 
        name: "Mr Peter A", 
        title: "Vice President", 
        image: "", 
        category: "elected"
     },
    { 
        name: "Mr Stanley Okonkwo",
        title: "General Secretary", 
        image: "images/General-Sec.jpg", 
        category: "elected" 
    },
    { 
        name: "Mr Okoroafor Kenneth", 
        title: "Financial Secretary", 
        image: "", 
        category: "elected" 
    },
    { 
        name: "Akawe Kenneth", 
        title: "Welfare Officer", 
        image: "images/keneth-Akawe.jpg",
        category: "elected"
    },
    { 
        name: "Mr Iyang Ramsey", 
        title: "Public Relations Officer/Media", 
        image: "", 
        category: "elected"
    },
    { 
        name: "Mr Era Okojie", 
        title: "Provost/DSS", 
        image: "", 
        category: "elected"
    },

    // 2. APPOINTED EXECUTIVES   
    {
        name: "Mr Obinna Ositadinma Anatogu", 
        title: "Asst. DSS/Provost", 
        image: "",
        category: "appointed"
    },
     { 
        name: "Mr Akojuru Augustine Ugochukwu", 
        title: "Tech Officer/Asst. Welfare Officer", 
        image: "images/Austin-Pablo.jpg", 
        category: "appointed"
    },
    { 
        name: "MrAmadi Chile Saviour", 
        title: "Coach/Curator", 
        image: "", 
        category: "appointed"
    },
    { 
        name: "Mr Agbale Clifford", 
        title: "Captain", 
        image: "", 
        category: "appointed"
    },
    { 
        name: "Barr. Edobor Isreal Idiake", 
        title: "Legal Adviser", 
        image: "", 
        category: "appointed"
    },
    { 
        name: "Hon. Akawe Simon Romanus(JP)", 
        title: "Pioneer Chairman/Patron", 
        image: "images/bishop.jpg", 
        category: "appointed"
    },
    {
        name: "Mr Ibrahim Mohammed",
        title: "Asst. Coach",
        image: "",
        category: "appointed"
     },
     {
        name: "Mr Nnachi Kingsley",
        title: "Asst. Coach",
        image: "images/nnachi.jpg",
        category: "appointed"
     },
     {
        name: "Mr Ahuchogu Chinagozim",
        title: "Technical Adviser",
        image: "",
        category: "appointed"
     },
     {
        name: "Chief Hon. Godspower Wadikom",
        title: "Match Commissioner",
        image: "",
        category: "appointed"
     },
     {
        name: "Ms Jennifer Nwogu",
        title: "Welfare Support",
        image: "images/baba-stevo.jpg",
        category: "appointed"
     },
     {
        name: "Mr Nnanna Victor",
        title: "Asst. PRO/Media Support",
        image: "images/baba-stevo.jpg",
        category: "appointed"
     },
     {
        name: "Mr Ighorodje Eseoghene Bright",
        title: "Asst. Curator",
        image: "images/baba-stevo.jpg",
        category: "appointed"
     },
        {
        name: "Mr Igwe Prince Ugochukwu",
        title: "Chief Giration Officer",
        image: "images/baba-stevo.jpg",
        category: "appointed"
     },
      {
        name: "Mr Pepple Erik",
        title: "Club Saftey/Security Officer",
        image: "images/baba-stevo.jpg",
        category: "appointed"
     },
    {
        name: "Mr Ezekwesili Alex",
        title: "Diaspora Relations Officer",
        image: "images/baba-stevo.jpg",
        category: "appointed"
     },

    // 3. BOARD OF TRUSTEES
    {
        name: "Mr Umo B. Adam",
        title: "Board Of Trustee (Chairman)",
        image: "images/elder-umoh.jpg",
        category: "bot"
    },
    {
        name: "Mr Ekaette Umoren",
        title: "Board Of Trustee Member",
        image: "",
        category: "bot"
     },
     { 
        name: "Mr Emeka Ebolem", 
        title: "Board Of Trustee Member",
        image: "images/Chairman-Emeritus.jpg",
        category: "bot"
    },
    {
        name: "HC. Damisa Mike",
        title: "Board Of Trustee Member",
        image: "images/national.jpg",
        category: "bot"
     },
     {
        name: "Engr. Omidire Stephen",
        title: "Board Of Trustee (Secretary)",
        image: "images/baba-stevo.jpg",
        category: "bot"
     },
];



// Function to generate executive cards dynamically
document.addEventListener('DOMContentLoaded', () => {
    const grids = {
        elected: document.getElementById('electedGrid'),
        appointed: document.getElementById('appointedGrid'),
        bot: document.getElementById('botGrid')
    };

    const placeholder = "images/BAS-Logo.jpg";

    executives.forEach(member => {
        const targetGrid = grids[member.category];
        
        if (targetGrid) {
            const card = document.createElement('div');
            card.className = 'member-card';

            card.innerHTML = `
                <div class="member-image-container">
                    <img src="${member.image || placeholder}" alt="${member.name}" class="member-img">
                </div>
                <span class="member-role">${member.title}</span>
                <h4 class="member-name">${member.name}</h4>
            `;
            targetGrid.appendChild(card);
        }
    });
});




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


 
  

 // 1. THE COUNTDOWN (Works for Home & Events)
function startCountdown() {
    const targetDate = new Date("April 25, 2026 09:00:00").getTime();
    
    setInterval(() => {
        const now = new Date().getTime();
        const diff = targetDate - now;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // HOMEPAGE UPDATE
        const dEl = document.getElementById("days");
        if (dEl) {
            dEl.innerText = d;
            document.getElementById("hours").innerText = h.toString().padStart(2, '0');
            document.getElementById("minutes").innerText = m.toString().padStart(2, '0');
            document.getElementById("seconds").innerText = s.toString().padStart(2, '0');
        }

        // EVENTS PAGE UPDATE
        const eventEl = document.getElementById("countdown-timer");
        if (eventEl) {
            eventEl.innerText = `${d}d : ${h}h : ${m}m : ${s}s`;
        }
    }, 1000);
}


// 2. Initialize the form logic on page load
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const checkboxes = document.querySelectorAll('.pledge-check');

    // 1. SAFETY CHECK: Only run if form exists on this page
    if (contactForm && submitBtn) {
        
        // Function to toggle button based on checkboxes
        function validateChecks() {
            const allChecked = Array.from(checkboxes).every(c => c.checked);
            submitBtn.disabled = !allChecked;
        }

        checkboxes.forEach(box => {
            box.addEventListener('change', validateChecks);
        });

        // 2. FORM SUBMISSION
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            submitBtn.innerText = "SENDING...";
            submitBtn.disabled = true;

            emailjs.sendForm('service_l32lavj', 'template_ylxh35f', this)
                .then(() => {
                    submitBtn.innerText = "SENT SUCCESSFULLY!";
                    submitBtn.style.backgroundColor = "#28a745";
                    contactForm.reset();
                    // Re-enable after 5s
                    setTimeout(() => {
                        submitBtn.innerText = "SEND APPLICATION";
                        submitBtn.style.backgroundColor = "";
                        validateChecks();
                    }, 5000);
                })
                .catch((err) => {
                    console.error("EmailJS Error:", err);
                    submitBtn.innerText = "ERROR: RETRY";
                    submitBtn.style.backgroundColor = "#dc3545";
                    submitBtn.disabled = false;
                });
        });
    }
});

// 3. START EVERYTHING
document.addEventListener('DOMContentLoaded', () => {
    startCountdown();
});