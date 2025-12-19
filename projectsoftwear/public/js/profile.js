document.addEventListener("DOMContentLoaded", () => {
    // Fetch and populate user profile on page load
    fetchUserProfile();

    // Handle phone edit button
    const editPhoneButton = document.getElementById('edit-phone-button');
    const phoneInput = document.getElementById('phone');
    const savePhoneButton = document.getElementById('save-phone-button');

    editPhoneButton.addEventListener('click', () => {
        phoneInput.disabled = false; // Enable the phone input
        savePhoneButton.style.display = 'block'; // Show the save button
        editPhoneButton.style.display = 'none'; // Hide the edit button
    });

    savePhoneButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const updatedPhone = phoneInput.value.trim();
        if (!updatedPhone) {
            alert('Phone number cannot be empty.');
            return;
        }

        try {
            const response = await fetch('/api/update-phone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: updatedPhone }),
            });

            if (response.ok) {
                alert('Phone number updated successfully!');
                phoneInput.disabled = true; // Disable the phone input
                savePhoneButton.style.display = 'none'; // Hide the save button
                editPhoneButton.style.display = 'block'; // Show the edit button
            } else {
                alert('Failed to update phone number.');
            }
        } catch (error) {
            console.error('Error updating phone number:', error);
            alert('An error occurred while updating the phone number.');
        }
    });

    // Handle "Choose Image" button functionality
    const chooseFileButton = document.getElementById('choose-file-button');
    const profileImageInput = document.getElementById('profile-image-input');
    const profileImage = document.getElementById('profile-image');

    chooseFileButton.addEventListener('click', () => {
        profileImageInput.click(); // Trigger the file input click
    });

    profileImageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) {
            alert('No file selected.');
            return;
        }
    
        const formData = new FormData();
        formData.append('profile_image', file);
    
        try {
            const response = await fetch('/api/upload-profile-image', {
                method: 'POST',
                body: formData,
            });
    
            const result = await response.json();
    
            if (response.ok) {
                document.getElementById('profile-image').src = result.imagePath;
                alert('Profile image updated successfully!');
            } else {
                alert(result.error || 'Failed to upload image.');
            }
        } catch (error) {
            console.error('Error uploading profile image:', error);
            alert('An error occurred while uploading the image.');
        }
    });
    
});

// Fetch and populate user profile data
async function fetchUserProfile() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        const profile = await response.json();

        // Populate form fields with user data
        document.getElementById('name').value = profile.username || ''; // Name field
        document.getElementById('phone').value = profile.phone || ''; // Phone field
        document.getElementById('national-id').value = profile.national_id || ''; // National ID
        document.getElementById('address1').value = profile.address1 || ''; // Address 1
        document.getElementById('address2').value = profile.address2 || ''; // Address 2
        document.getElementById('city').value = profile.city || ''; // City
        document.getElementById('profile-image').src = profile.profile_image || 'default-profile.png'; // Profile image
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Unable to load profile data.');
    }
}
