<?php

use OpenSoutheners\FlexUrl\FlexUrl;

if (! function_exists('flex_url')) {
    /**
     * Creates a `FlexUrl` builder/parser. Alias for `FlexUrl::make()`.
     */
    function flex_url(?string $url = null): FlexUrl
    {
        return FlexUrl::make($url);
    }
}
