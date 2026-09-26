<?php

namespace App\Exceptions;

use Exception;

class KnownException extends Exception
{
    public function __construct(
        string $message,
        public int $status = 400,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $status, $previous);
    }
}
