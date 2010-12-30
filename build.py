#!/usr/bin/python

import os
os.system('cd editor && python build.py release')
os.system('cd game && python build.py release')

def compile(a, b):
	temp = b + '.temp'
	atext = open(a).read()

	f = open(temp, 'w')
	f.write(atext.replace('extends', 'subclasses'))
	f.close()

	compile = ' '.join([
		'java -jar ./closure_compiler/compiler.jar',
		'--compilation_level ADVANCED_OPTIMIZATIONS',
		'--externs ./closure_compiler/jquery-1.4.4.externs.js',
		'--externs ./closure_compiler/jquery.mousewheel.externs.js',
		'--externs ./closure_compiler/player.externs.js',
		'--js "%s"',
		'--js_output_file "%s"'
	])

	os.system(compile % (temp, b))
	os.system('rm -f "%s"' % temp)

	btext = open(b).read()
	print 'built %s (%.2f%%)' % (b, 100.0 * len(btext) / len(atext))

def copy(a, b):
	os.system('cp "%s" "%s"' % (a, b))
	print 'copied %s' % b

compile('./editor/www/editor.js', './rails/public/javascripts/editor.js')
compile('./game/www/rapt.js', './rails/public/javascripts/rapt.js')

copy('./editor/www/style.css', './rails/public/stylesheets/editor.css')
copy('./game/www/style.css', './rails/public/stylesheets/game.css')
