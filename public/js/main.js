// public/js/main.js

// Mobile Navigation Toggle
const menuIcon = document.getElementById('menuIcon');
const navLinks = document.getElementById('navLinks');

if (menuIcon) {
    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-active');
        menuIcon.classList.toggle('active');
        const icon = menuIcon.querySelector('i');
        icon.classList.toggle('fa-times');
        icon.classList.toggle('fa-bars');
    });
}

// AI Interaction Function
async function askGPT() {
    const questionInput = document.getElementById('question');
    const question = questionInput.value.trim();

    if (question === "") {
        alert("Please enter a question.");
        return;
    }

    const responseDiv = document.getElementById('response');
    const answerText = document.getElementById('answer');
    const loader = document.getElementById('loader');
    responseDiv.style.display = 'none';  // Hide the response area initially.
    loader.style.display = 'block';      // Show loader.

    try {
        const response = await fetch('/api/ai', {  // Relative path for Vercel deployment
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question })
        });

        const data = await response.json();

        if (response.ok) {
            answerText.innerHTML = formatAnswer(data.answer);  // Display the formatted response.
            responseDiv.style.display = 'block';  // Show the response area with the answer.
        } else {
            alert(data.error || 'There was an issue with the API call.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an issue with the API call.');
    } finally {
        loader.style.display = 'none';  // Hide loader.
    }
}

function formatAnswer(answer) {
    // Enhanced formatting: headings, bullet points, numbered lists, blockquotes, and code snippets
    const lines = answer.split('\n').filter(line => line.trim() !== '');
    let formattedAnswer = '';
    let listOpen = false;
    let orderedList = false;

    lines.forEach(line => {
        if (line.startsWith('- ')) {
            if (!listOpen || orderedList) {
                formattedAnswer += '<ul>';
                listOpen = true;
                orderedList = false;
            }
            formattedAnswer += `<li>${sanitizeHTML(line.substring(2))}</li>`;
        } else if (line.match(/^\d+\.\s/)) {
            if (!listOpen || !orderedList) {
                formattedAnswer += '<ol>';
                listOpen = true;
                orderedList = true;
            }
            const listItem = line.replace(/^\d+\.\s/, '');
            formattedAnswer += `<li>${sanitizeHTML(listItem)}</li>`;
        } else if (line.startsWith('> ')) {
            // Handle blockquotes
            if (listOpen) {
                formattedAnswer += orderedList ? '</ol>' : '</ul>';
                listOpen = false;
                orderedList = false;
            }
            const quote = line.replace(/^>\s/, '');
            formattedAnswer += `<blockquote>${sanitizeHTML(quote)}</blockquote>`;
        } else if (line.startsWith('```') && line.endsWith('```')) {
            // Handle code snippets
            if (listOpen) {
                formattedAnswer += orderedList ? '</ol>' : '</ul>';
                listOpen = false;
                orderedList = false;
            }
            const code = line.replace(/```/g, '');
            formattedAnswer += `<pre><code>${sanitizeHTML(code)}</code></pre>`;
        } else {
            if (listOpen) {
                formattedAnswer += orderedList ? '</ol>' : '</ul>';
                listOpen = false;
                orderedList = false;
            }
            if (line.endsWith(':')) {
                formattedAnswer += `<h4>${sanitizeHTML(line)}</h4>`;
            } else {
                formattedAnswer += `<p>${sanitizeHTML(line)}</p>`;
            }
        }
    });

    if (listOpen) {
        formattedAnswer += orderedList ? '</ol>' : '</ul>';
    }

    return formattedAnswer;
}

// Utility function to sanitize HTML to prevent XSS attacks
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
