# instagram-final-project-gsg - Dev Branch 📝

## Introduction: 📸
   Welcome to InstaClone - our take on the beloved photo-sharing platform, Instagram. Inspired by the global phenomenon that revolutionized visual storytelling, we've embarked on a journey to recreate the magic of capturing and sharing life's moments.

   We've incorporated familiar features that millions have come to love and use daily, while adding our own unique touch to enhance user experience. Whether you're a budding photographer, a visual storyteller, or someone who just loves to share snippets of life, InstaClone is the platform for you.
   
   Dive in to discover:

- 🌅 A seamless photo and video sharing experience
- ❤️ Instant interactions with likes, comments, and shares
- 🌐 Explore amazing content with our community
- 🤝 Connect and network with friends and creators alike
- 🔒 Prioritized privacy and user security
- ⏩ Smooth User Experience with Fast technics

## Technical Overview: 🛠
 
### 1. Architectural Design: 🔨
Our Instagram clone follows a modular architecture, ensuring separation of concerns. Each module, such as User, Post, Comments, and Story, is decoupled yet integrated seamlessly for smooth data flow and scalability. ⚖️

### 2. CRUD Operations: ✨

#### User Module: 🙋‍♂️

- Create: Users can sign up using their credentials, and their data is securely hashed and stored in the database.
- Read: User profiles can be fetched to display relevant information such as posts, followers, and following.
- Update: Users have the flexibility to modify their profile details, including profile picture, bio, and status.
- Delete: Users can deactivate or permanently delete their accounts, ensuring data privacy and GDPR compliance.

#### Post Module: 📊

- Create: Users can upload images or videos with captions.
- Read: The main feed displays posts, and individual post views allow for detailed interaction. 
- Update: Post captions and other settings can be edited post-publication.
- Delete: Users can remove their posts, which also cascades deletions to associated comments and likes.

#### Comments Module: 💬

- Create: Users can comment on posts, fostering community engagement.
- Read: Comments are fetched and displayed depending on it's post time.
- Update: Users can edit their comments, ensuring continued relevance and appropriateness.
- Delete: Inappropriate or outdated comments can be deleted by the users who posted them.

#### Story Module: 🤾‍♂️

- Create: Users can upload temporary images or videos to their stories, viewable for 24 hours.
- Read: Users can see the stories of other users as long as it's uploaded.
- Update: Users can add or modify metadata, such as text overlays, even after publishing the story.
- Delete: Stories auto-expire after 24 hours but can also be manually deleted by the user.

## 3. Database Design: 💽
Incorporating AWS RDS into our project ensured a robust, scalable, and managed relational database solution, allowing the development team to focus on application features and logic rather than database administration tasks.

---

# A Developer's Routes Guide ➡️ ✨
## Link on wiki 👇
  [A Routes Developer's Guide ➡️ ✨](https://github.com/Husam-AbuZina/instagram-final-project-gsg-main/wiki/A-Developer's-Routes-Guide-➡%EF%B8%8F-✨)

# Detailed Documentation of the project 📚
## Link on wiki 👇
   [Full Documentation 📚](https://github.com/Husam-AbuZina/instagram-final-project-gsg-main/wiki)
