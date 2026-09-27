CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL,

    CONSTRAINT chk_category_type
        CHECK (type IN ('INCOME', 'EXPENSE')),

    CONSTRAINT uq_category_name_type
        UNIQUE (name, type)
);

ALTER TABLE transactions
    ADD COLUMN category_id BIGINT;

ALTER TABLE transactions
    ADD CONSTRAINT fk_transaction_category
        FOREIGN KEY (category_id)
            REFERENCES categories(id);

CREATE INDEX idx_transactions_category_id
    ON transactions(category_id);