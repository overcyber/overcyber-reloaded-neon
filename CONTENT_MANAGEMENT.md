
# Content Management System

This document explains how to use the admin panel to manage your website's content.

## How to Access the Admin Panel

1. Navigate to the `/admin` route of your website (e.g., `http://yoursite.com/admin`)
2. Enter the default password: `admin123`
3. Note: The admin panel is IP-restricted by default to localhost/development IPs

## Security Considerations

- **IMPORTANT**: Change the default password in the `Admin.tsx` file
- To add allowed IP addresses, edit the `allowedIPs` array in `Admin.tsx`
- This is a simple authentication system. For production, consider implementing a more robust solution.

## Managing the About Page

1. Access the admin panel and navigate to the "ABOUT PAGE" tab
2. Update the following sections:
   - Full Name
   - Professional Title 
   - Biography
   - Education
   - Experience
   - Publications
3. Click "Save Changes" to update the content
4. The changes will be stored in the browser's localStorage

## Managing Projects

1. Access the admin panel and navigate to the "PROJECTS" tab

### Adding a New Project
1. Click the "Add New Project" button
2. Fill in the project details:
   - Title: Your project name
   - Tags: Comma-separated list of technologies (e.g., "Python, Machine Learning")
   - Description: Brief overview of the project
   - Image URL: Link to the project thumbnail image
   - GitHub URL: Link to the project's repository
   - Live Demo URL: (Optional) Link to a live version of the project
   - README Content: Markdown content for the project details
3. Click "Add Project" to save

### Editing a Project
1. Find the project in the list and click "Edit"
2. Modify the project details
3. Click "Update Project" to save changes

### Deleting a Project
1. Find the project in the list and click "Delete"
2. Confirm the deletion when prompted

## Data Storage

This admin system uses the browser's localStorage to persist content changes. This means:
- Changes are stored per browser/device
- Clearing browser data will reset the content to defaults
- For production, consider implementing a server-based storage solution

## Production Deployment Notes

For deploying to a production environment:
1. Change the default password in `Admin.tsx`
2. Update the `allowedIPs` array with your trusted IP addresses
3. Consider implementing a more secure authentication method
4. For persistent storage, replace localStorage with a database solution

## Troubleshooting

If you encounter issues:
1. Ensure you're using a supported browser with localStorage enabled
2. Check that you're accessing from an allowed IP address
3. If content doesn't update, try clearing your browser cache and refreshing
