(async function automateQuoraUpvotes() {
    let upvotedPosts = new Set(); // Track already upvoted posts
    let totalUpvoted = 0;
    const maxUpvotes = 1000000; // Large number to ensure continuous operation
    const upvoteButtonSelector = '.q-click-wrapper.puppeteer_test_votable_upvote_button.bobc9nh.b1cg7ppz.c1nud10e.qu-borderTopLeftRadius--pill.qu-borderBottomLeftRadius--pill.qu-alignItems--center.qu-justifyContent--center.qu-whiteSpace--nowrap.qu-userSelect--none.qu-display--inline-flex.qu-tapHighlight--white.qu-textAlign--center.qu-cursor--pointer.qu-hover--bg--darken';

    // Create floating popup
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.right = '20px';
    popup.style.padding = '10px';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popup.style.color = 'white';
    popup.style.borderRadius = '5px';
    popup.style.fontSize = '14px';
    popup.style.zIndex = '10000';
    popup.innerHTML = `
        <h4>Quora Auto Upvoter</h4>
        <p id="upvoteCount">Upvoted: 0</p>
        <p id="status">Status: Running...</p>
    `;
    document.body.appendChild(popup);

    function updatePopup() {
        document.getElementById('upvoteCount').innerText = `Upvoted: ${totalUpvoted}`;
    }

    function updateStatus(text) {
        document.getElementById('status').innerText = `Status: ${text}`;
    }

    async function waitFor(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function clickElement(element, description, delay = 2000) {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to button
            await waitFor(500); // Allow smooth scrolling
            element.click();
            console.log(`✅ Clicked: ${description}`);
            await waitFor(delay);
            return true;
        }
        return false;
    }

    async function upvotePost(upvoteButton) {
        if (!upvoteButton || upvotedPosts.has(upvoteButton)) return false; // Skip if already upvoted

        let isAlreadyUpvoted = upvoteButton.getAttribute('aria-pressed') === 'true';
        if (isAlreadyUpvoted) {
            console.log("✅ Already upvoted, skipping...");
            return false;
        }

        upvotedPosts.add(upvoteButton); // Mark as processed
        await clickElement(upvoteButton, 'Upvote button', 2000);

        totalUpvoted++;
        updatePopup();
        return true;
    }

    async function scrollAndUpvote() {
        let lastScrollHeight = 0;
        let scrollAttempts = 0;

        while (true) {
            updateStatus("Scrolling & Looking for Upvotes...");
            let upvoteButtons = Array.from(document.querySelectorAll(upvoteButtonSelector)).filter(btn => !upvotedPosts.has(btn));
            
            if (upvoteButtons.length === 0) {
                scrollAttempts++;
                console.log(`🔄 No new upvote buttons found. Scrolling attempt: ${scrollAttempts}`);

                if (scrollAttempts >= 5) {  
                    updateStatus("Reloading page...");
                    console.log("🔄 Reloading page due to lack of new posts...");
                    window.location.reload();
                    return;
                }

                window.scrollBy(0, 1000);
                await waitFor(3000);
                continue;
            }

            scrollAttempts = 0; // Reset scroll attempts if we find new posts

            for (let btn of upvoteButtons) {
                await upvotePost(btn);
                await waitFor(2000);
            }

            window.scrollBy(0, 1000);
            await waitFor(3000);

            if (document.documentElement.scrollHeight === lastScrollHeight) {
                console.log("📌 Reached end of feed. Reloading...");
                updateStatus("Reloading page...");
                window.location.reload();
                return;
            }
            lastScrollHeight = document.documentElement.scrollHeight;
        }
    }

    console.log("🚀 Quora Auto Upvoter Started...");
    await scrollAndUpvote();
    console.log("✅ Script Running Continuously!");
})();

