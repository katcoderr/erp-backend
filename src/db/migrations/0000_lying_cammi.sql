CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"source" varchar(100) NOT NULL,
	"owner" varchar(100) NOT NULL,
	"stage" varchar(50) DEFAULT 'New Lead' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
