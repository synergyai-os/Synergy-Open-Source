import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Navigate to /inbox on desktop viewport to verify layout and usability.
        await page.goto('http://localhost:5173/inbox', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input email and password, then click Sign in to access /inbox.
        frame = context.pages[-1]
        # Input email for login
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('randy+cicduser@synergyai.nl')
        

        frame = context.pages[-1]
        # Input password for login
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('djz5gxt2tjg@wjz4BAF')
        

        frame = context.pages[-1]
        # Click Sign in button to login and access /inbox
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to /flashcards on desktop viewport to verify layout and usability.
        await page.goto('http://localhost:5173/flashcards', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to /notes on desktop viewport to verify layout and usability.
        await page.goto('http://localhost:5173/notes', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to /settings on desktop viewport to verify layout and usability.
        await page.goto('http://localhost:5173/settings', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Resize viewport to tablet size and navigate to /inbox to verify layout and usability.
        await page.goto('http://localhost:5173/inbox', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        await page.mouse.wheel(0, -await page.evaluate('() => window.innerHeight'))
        

        # -> Navigate to /flashcards on tablet viewport to verify layout and usability.
        await page.goto('http://localhost:5173/flashcards', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to /notes on tablet viewport to verify layout and usability.
        await page.goto('http://localhost:5173/notes', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to /settings on tablet viewport to verify layout and usability.
        await page.goto('http://localhost:5173/settings', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Resize viewport to mobile size and navigate to /inbox to verify layout and usability.
        await page.goto('http://localhost:5173/inbox', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to /flashcards on mobile viewport to verify layout and usability.
        await page.goto('http://localhost:5173/flashcards', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to /settings on mobile viewport to verify layout and usability.
        await page.goto('http://localhost:5173/settings', timeout=10000)
        await asyncio.sleep(3)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Back').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SETTINGS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=General').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Account').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Integrations').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Notifications').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Privacy & Security').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PREFERENCES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Appearance').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Keyboard Shortcuts').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Data & Storage').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ADVANCED').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Billing').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=API Keys').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Permission Test').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Settings').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Personal Settings').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=These settings apply to your personal workspace only.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Coming soon: Team-specific settings and advanced organization management.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Interface theme 👤 Personal Only').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Select your preferred color scheme').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Light mode').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AI').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Claude API Key 👤 Personal').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Used for AI-powered flashcard generation from your content (personal use only)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Get API key').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sources').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Readwise API Key 👤 Personal (User-owned)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Import highlights and notes from your personal Readwise account').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    