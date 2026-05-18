use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: i64,
    pub title: String,
    pub description: String,
    pub tags: String,
    pub image: String,
    pub github: String,
    pub live: Option<String>,
    pub stars: i64,
    pub forks: i64,
    pub readme: String,
    pub ord: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectInput {
    pub title: String,
    pub description: String,
    pub tags: String,
    pub image: String,
    pub github: String,
    pub live: Option<String>,
    pub readme: String,
    #[serde(default)]
    pub stars: i64,
    #[serde(default)]
    pub forks: i64,
    #[serde(default)]
    pub ord: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Post {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub content: String,
    pub image: Option<String>,
    pub status: String,
    #[serde(rename = "publishedAt")]
    pub published_at: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PostInput {
    pub title: String,
    pub slug: String,
    #[serde(default)]
    pub excerpt: String,
    pub content: String,
    pub image: Option<String>,
    #[serde(default = "default_status")]
    pub status: String,
}

fn default_status() -> String {
    "draft".to_string()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Comment {
    pub id: String,
    #[serde(rename = "postId")]
    pub post_id: String,
    #[serde(rename = "authorName")]
    pub author_name: String,
    pub body: String,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContactInput {
    pub name: String,
    pub email: String,
    #[serde(default)]
    pub subject: String,
    pub body: String,
    pub pow: PowSolution,
    #[serde(default)]
    pub website: String, // honeypot
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommentInput {
    #[serde(rename = "authorName")]
    pub author_name: String,
    #[serde(rename = "authorEmail")]
    pub author_email: String,
    pub body: String,
    pub pow: PowSolution,
    #[serde(default)]
    pub website: String, // honeypot
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PowSolution {
    pub nonce: String,
    pub solution: String,
}

#[derive(Debug, Serialize)]
pub struct PowChallenge {
    pub nonce: String,
    pub difficulty: u32,
}
