<?php

if ( !function_exists('get_virtual_templates') )
{
    function get_virtual_templates()
    {
        return [
            'custom'    => 'Custom template',
            'cart'      => 'Cart template',
            'pay'       => 'Pay template',
            'account'   => 'Account template',
            'home'      => 'Home template',
        ];
    }
}
