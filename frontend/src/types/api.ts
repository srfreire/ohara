/**
 * API v2.0 Type Definitions
 * Based on Ohara API v2.0 Documentation
 */

// ============================================================================
// Standard Response Wrappers
// ============================================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiDeleteResponse {
  success: true;
  data: null;
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
}

export interface PaginationMeta {
  next_cursor: string | null;
  has_more: boolean;
  limit: number;
}

// ============================================================================
// Pagination Parameters
// ============================================================================

export interface CursorPaginationParams {
  limit?: number; // 1-100, default 25
  cursor?: string; // Base64 cursor
  sort_by?: string;
  order?: "asc" | "desc";
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string; // UUID
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface UserCreateInput {
  email: string;
  name: string;
  avatar_url?: string;
}

export interface UserUpdateInput {
  email?: string;
  name?: string;
  avatar_url?: string;
}

export interface UserListParams extends CursorPaginationParams {
  sort_by?: "created_at" | "email" | "name";
}

// ============================================================================
// Collection Types
// ============================================================================

export type CollectionVisibility = "private" | "unlisted" | "public";

export interface Collection {
  id: string; // UUID
  name: string;
  user_id: string; // UUID
  description?: string;
  visibility: CollectionVisibility;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface CollectionCreateInput {
  name: string;
  user_id: string;
  description?: string;
  visibility?: CollectionVisibility;
}

export interface CollectionUpdateInput {
  name?: string;
  description?: string;
  visibility?: CollectionVisibility;
}

export interface CollectionListParams extends CursorPaginationParams {
  user_id?: string; // Filter by user UUID
}

// ============================================================================
// Collection Item Types
// ============================================================================

export interface CollectionItem {
  id: string; // UUID
  collection_id: string; // UUID
  document_id: string; // UUID
  created_at: string; // ISO 8601
}

export interface CollectionItemCreateInput {
  document_id: string;
}

// ============================================================================
// Document Types
// ============================================================================

export interface Document {
  id: string; // UUID
  title: string;
  user_id: string; // UUID
  folder_id?: string; // UUID
  pdf_url?: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface DocumentCreateInput {
  title: string;
  user_id: string;
  folder_id?: string;
  pdf_url?: string;
}

export interface DocumentUpdateInput {
  title?: string;
  folder_id?: string;
  pdf_url?: string;
}

export interface DocumentListParams extends CursorPaginationParams {
  folder_id?: string; // Filter by folder
  search?: string; // Search by title
  created_after?: string; // ISO 8601 datetime
  created_before?: string; // ISO 8601 datetime
}

export interface DocumentUrlResponse {
  url: string;
  expires_in: number; // seconds
}

// ============================================================================
// Folder Types
// ============================================================================

export interface Folder {
  id: string; // UUID
  name: string;
  user_id: string; // UUID
  parent_id?: string; // UUID for hierarchy
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface FolderCreateInput {
  name: string;
  user_id: string;
  parent_id?: string;
}

export interface FolderUpdateInput {
  name?: string;
  parent_id?: string;
}

export interface FolderListParams extends CursorPaginationParams {
  parent_id?: string; // Filter by parent folder
}

// ============================================================================
// Comment Types
// ============================================================================

export interface Comment {
  id: string; // UUID
  user_id: string; // UUID
  document_id: string; // UUID
  content: string;
  start_offset?: number;
  end_offset?: number;
  parent_comment_id?: string; // UUID for threading
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  user_name?: string; // User's display name (populated from users table JOIN)
}

export interface CommentCreateInput {
  user_id: string;
  document_id: string;
  content: string;
  start_offset?: number;
  end_offset?: number;
  parent_comment_id?: string;
}

export interface CommentUpdateInput {
  content?: string;
  start_offset?: number;
  end_offset?: number;
}

export interface CommentListParams extends CursorPaginationParams {
  document_id?: string; // Filter by document
  user_id?: string; // Filter by user
  parent_comment_id?: string; // Get replies
}

// ============================================================================
// Reaction Types
// ============================================================================

export type ReactionType = "like" | "love" | "insight" | "question" | "flag";

export interface Reaction {
  id: string; // UUID
  comment_id: string; // UUID
  user_id: string; // UUID
  reaction_type: ReactionType;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface ReactionCreateInput {
  comment_id: string;
  user_id: string;
  reaction_type: ReactionType;
}

export interface ReactionUpdateInput {
  reaction_type: ReactionType;
}

export interface ReactionListParams extends CursorPaginationParams {
  comment_id?: string; // Filter by comment
  reaction_type?: ReactionType;
  user_id?: string; // Filter by user
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthTokenResponse {
  access_token: string;
}

export interface AuthCallbackParams {
  access_token: string;
  user_id: string;
  email: string;
  name: string;
}

// ============================================================================
// Agent/Chat Types
// ============================================================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO 8601
}

export interface ChatStreamRequest {
  messages: ChatMessage[];
  model: string; // e.g., 'gpt-4.1'
  document_id?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  document_id?: string;
}
