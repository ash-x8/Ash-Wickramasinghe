from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Check Public Homepage (Verify no Admin Terminal / Shield links exist)
        page.goto('http://localhost:5173/')
        page.wait_for_selector('text=Ash Wickramasinghe')
        page.screenshot(path='/home/jules/verification/public_homepage.png')

        # 2. Check Admin Login Page
        page.goto('http://localhost:5173/admin/login')
        page.wait_for_selector('text=Admin Email Address')
        page.screenshot(path='/home/jules/verification/admin_login.png')

        # 3. Direct Access / Logged in Dashboard
        page.get_by_role('button', name='Direct Studio Access (Verified Admin)').click()
        page.wait_for_selector('text=Studio Admin')
        page.screenshot(path='/home/jules/verification/admin_dashboard_cleaned.png')

        browser.close()

if __name__ == '__main__':
    main()
python test_public_and_admin.py
