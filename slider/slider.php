<?php

class Slider{
    static function getData($pagination, $isInit = false){
        $items = json_decode(file_get_contents(__DIR__.'/../data.json'), true);

        if(!empty($pagination['filter'])){
            $items = self::filter($pagination['filter'], $items);
        }

        $data = self::paginate($pagination, $items);

        if($isInit) return json_encode($data);
        return self::response($data);
    }

    static function includes($src, $values){
        $result = false;
        $src = strtoupper($src);
        foreach ($values as $value) {
            if (strpos($src, $value) !== false) {
                $result = true;
                break;
            }
        }
        return $result;
    }

    static function filter($filter, $data){
        list($param, $rule, $value) = explode(':', $filter);
        return array_filter($data, function ($item) use ($param, $rule, $value){
            switch ($rule){
                case 'includes':
                    if (empty($item[$param])) return false;

                    $values = explode('|', strtoupper($value));
                    return self::includes($item[$param], $values);
                case 'not-includes':
                    if (empty($item[$param])) return false;

                    $values = explode('|', strtoupper($value));
                    return !self::includes($item[$param], $values);
                case 'equal':
                    return (isset($item[$param]) && (string) $item[$param] === (string) $value);
                case 'less':
                    return (!empty($item[$param]) && (int) $item[$param] < (int) $value);
                case 'more':
                    return (isset($item[$param]) && (int) $item[$param] > (int) $value);
                default:
                    return true;
            }
        });
    }

    static function paginate($pagination, $data){

        $bench = isset($pagination['bench']) ? $pagination['bench'] : 1;
        $filter = isset($pagination['filter']) ? $pagination['filter'] : '';
        $benchSize = isset($pagination['benchSize']) ? $pagination['benchSize'] : 4;

        $total = count( $data );
        $totalPages = ceil( $total / $benchSize );
        $bench = max($bench, 1);
        $bench = min($bench, $totalPages);
        $offset = ($bench - 1) * $benchSize;
        if ( $offset < 0 ) $offset = 0;

       return [
            'items' => array_slice( $data, $offset, $benchSize),
            'pagination' => [
                'total' => $total,
                'bench' => $bench,
                'filter' => $filter,
                'benchSize' => $benchSize,
            ],
        ];
    }

    static function response($data){
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
    }

    static function getSlideTemplate(){
        return file_get_contents(__DIR__.'/template.html');
    }

    static function render(){
        $data = self::getData(['bench' => 1, 'filter' => '', 'benchSize' => 4], true);
        $template = self::getSlideTemplate();
        echo "<div id='slider-track' class='slider-track'><div id='slider' class='slider'></div></div>";
        echo "<template id='slide'>$template</template>";
        echo "<script>
                const data = $data;
                const requestUrl = './';
                const slideToShow = 2;
                const containerId = 'slider';
                const slideTemplateId = 'slide';
				var slider = new Slider({data, requestUrl, containerId, slideToShow, slideTemplateId});
				slider.render();
                </script>";
        echo "<button onclick='slider.prev()' >< Prev</button><button onclick='slider.next()'>Nex ></button>";
        echo "<br/>";
        echo "<div id='slider-btns'>
            <a onclick='slider.setFilter(this, \"age:more:30\")'>> 30 years</a>
            <a onclick='slider.setFilter(this, \"age:less:50\")'>< 50 years</a> 
            <a onclick='slider.setFilter(this, \"profession:includes:IT|WEB\")'>IT</a>
            <a onclick='slider.setFilter(this, \"profession:not-includes:IT|WEB\")'>No IT</a>
            <a onclick='slider.setFilter(this, \"gender:equal:men\")'>Men</a>
            <a onclick='slider.setFilter(this, \"gender:equal:women\")'>Women</a>
        </div>";

    }
}
