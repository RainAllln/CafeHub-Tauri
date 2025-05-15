CREATE TABLE account (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Increased length for hashed passwords
    phone VARCHAR(50),
    gender TINYINT CHECK (gender IN (0, 1)), -- 0: Male, 1: Female
    join_time DATE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    user_type TINYINT CHECK (user_type IN (0, 1)) -- 0: Staff, 1: Customer
);

CREATE TABLE lost_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(20) NOT NULL,
    pick_place VARCHAR(20),
    pick_user_id BIGINT,
    claim_user_id BIGINT,
    pick_time DATE,
    claim_time DATE,
    status TINYINT CHECK (status IN (0, 1)), -- 0: Unclaimed, 1: Claimed
    FOREIGN KEY (pick_user_id) REFERENCES account (id),
    FOREIGN KEY (claim_user_id) REFERENCES account (id)
);

CREATE TABLE goods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    goods_name VARCHAR(20) NOT NULL,
    goods_type VARCHAR(20),
    stock INT DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE consumption (
    user_id BIGINT NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format 'YYYY-MM'
    goods_id INT NOT NULL,
    amount DECIMAL(10, 2) DEFAULT 0.00,
    PRIMARY KEY (user_id, month, goods_id),
    FOREIGN KEY (user_id) REFERENCES account (id),
    FOREIGN KEY (goods_id) REFERENCES goods (id)
);

CREATE TABLE message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    title VARCHAR(255),
    message_content TEXT,
    send_date DATE,
    read_status TINYINT CHECK (read_status IN (0, 1)), -- 0: Unread, 1: Read
    FOREIGN KEY (sender_id) REFERENCES account (id),
    FOREIGN KEY (receiver_id) REFERENCES account (id)
);