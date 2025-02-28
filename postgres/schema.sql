-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE vectors (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    item_data TEXT,
    embedding vector(768) -- nomic-embed-text
    -- embedding vector(3072) -- llama3.2:3b
    -- embedding vector(384) -- all-minilm:33m
    -- embedding vector(2048) -- tinyllama
    -- embedding vector(4096) -- mistral:7b
);

CREATE INDEX ON vectors USING hnsw (embedding vector_l2_ops);
CREATE INDEX vectors_type_idx ON vectors (type);