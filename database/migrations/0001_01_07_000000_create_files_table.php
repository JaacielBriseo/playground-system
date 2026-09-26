<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->morphs('fileable');

            $table->string('filename')->nullable();
            $table->string('relative_path')->nullable();
            $table->string('type')->nullable(); // e.g., image, document, video
            $table->string('size')->nullable(); // size in bytes
            $table->string('extension')->nullable(); // e.g., jpg, pdf, mp4
            $table->string('hash')->nullable(); // hash for file integrity check
            $table->string('field_name')->nullable(); // name of the field in the form where this file is uploaded
            $table->json('metadata')->nullable(); // additional metadata like dimensions, duration, etc.

            $table->softDeletes();
            $table->foreignId('created_by')->nullable()->constrained('users'); // user who created the file
            $table->foreignId('updated_by')->nullable()->constrained('users'); // user who last updated the file
            $table->foreignId('deleted_by')->nullable()->constrained('users'); // user who deleted the file, if applicable
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
