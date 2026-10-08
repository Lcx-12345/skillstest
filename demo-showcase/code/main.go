package main

import "fmt"

// Go 演示
func main() {
	words := []string{"Hello", "Trae", "Demo"}
	for i, w := range words {
		fmt.Println(i, w)
	}
}
