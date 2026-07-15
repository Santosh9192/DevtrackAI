-- DevTrack AI - Seed Data
-- IMPORTANT: This seed file uses placeholder bcrypt hashes.
-- You must generate actual hashes using the backend AFTER starting the server.
-- Option 1: Register users via the /api/auth/register endpoint
-- Option 2: Generate hashes with: python -c "from passlib.hash import bcrypt; print(bcrypt.hash('Admin@123'))"

USE devtrack_ai;

-- Insert Roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrator with full system access'),
('project_manager', 'Project manager who can create and manage projects'),
('developer', 'Developer who can work on assigned tasks');

-- NOTE: The following users use a PLACEHOLDER bcrypt hash.
-- To generate real hashes:
--   1. Start the backend server: uvicorn app.main:app
--   2. Register users via POST /api/auth/register
--   3. Or run: python -c "from passlib.hash import bcrypt; print(bcrypt.using(rounds=12).hash('Admin@123'))"
-- Replace the hashed_password values below with actual generated hashes.

-- Insert Admin User (password placeholder - generate actual hash)
INSERT INTO users (email, username, full_name, hashed_password, role_id, department, designation, is_active, is_verified) VALUES
('admin@devtrack.ai', 'admin', 'System Admin', '$2b$12$LJ3m4ys3Lk0TSwHCpNqrVO3RjXt4N5e4O5k5k5k5k5k5k5k5k5O', 1, 'Administration', 'System Administrator', 1, 1),
('manager@devtrack.ai', 'manager', 'Project Manager', '$2b$12$LJ3m4ys3Lk0TSwHCpNqrVO3RjXt4N5e4O5k5k5k5k5k5k5k5k5O', 2, 'Engineering', 'Senior Project Manager', 1, 1),
('dev@devtrack.ai', 'developer', 'Developer User', '$2b$12$LJ3m4ys3Lk0TSwHCpNqrVO3RjXt4N5e4O5k5k5k5k5k5k5k5k5O', 3, 'Engineering', 'Full Stack Developer', 1, 1);

-- Insert Settings for users
INSERT INTO user_settings (user_id, theme, language) VALUES (1, 'dark', 'en');
INSERT INTO user_settings (user_id, theme, language) VALUES (2, 'dark', 'en');
INSERT INTO user_settings (user_id, theme, language) VALUES (3, 'dark', 'en');
