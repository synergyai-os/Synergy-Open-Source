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
        # -> Enter valid email into the waitlist form and submit it.
        frame = context.pages[-1]
        # Enter valid email into the waitlist form email input
        elem = frame.locator('xpath=html/body/div/div/section[8]/div/div/div[2]/div[3]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('randy+cicduser@synergyai.nl')
        

        frame = context.pages[-1]
        # Click the Join the Waitlist button to submit the form
        elem = frame.locator('xpath=html/body/div/div/section[8]/div/div/div[2]/div[3]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Check the required checkbox and submit the waitlist form again to verify success feedback.
        frame = context.pages[-1]
        # Check the checkbox to receive updates
        elem = frame.locator('xpath=html/body/div/div/section[8]/div/div/div[2]/div[3]/div/form/div[3]/label/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click the Join the Waitlist button to submit the form with all required inputs
        elem = frame.locator('xpath=html/body/div/div/section[8]/div/div/div[2]/div[3]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Reload the page to reset the waitlist form and test invalid email submission.
        await page.goto('http://localhost:5173/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Enter invalid email into the email input field and submit the form to verify error handling.
        frame = context.pages[-1]
        # Enter invalid email into the waitlist form email input
        elem = frame.locator('xpath=html/body/div/div/section[8]/div/div/div[2]/div[3]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('invalid-email-format')
        

        frame = context.pages[-1]
        # Check the required checkbox to receive updates
        elem = frame.locator('xpath=html/body/div/div/section[8]/div/div/div[2]/div[3]/div/form/div[3]/label/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click the Join the Waitlist button to submit the form with invalid email
        elem = frame.locator('xpath=html/body/div/div/section[8]/div/div/div[2]/div[3]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Join the Waitlist').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=We respect your privacy. No spam. Build together.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    