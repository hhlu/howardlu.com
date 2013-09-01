---
layout: post
group: blog
tags:
- Linux
- Systems
- VMs
---
Vagrant is an application allowing easy creation and management of virtual machines,
and Puppet is a system configuration tool that works with it.

At my workplace, we use both of these to streamline our development process—you
can be sure everyone is working in the same environment, and if anyone new needs
to be brought onto a project, all they need to do is run a single command to get
started. This can be further extended to a production environment where Puppet
scripts can serve as a version-controlled source of documentation for how any
given server is configured.

While these tools certainly work well in a larger team environment, I find them
quite useful personally as well. I think most people have some sort of personal
file backup nowadays, that doesn't save you from the inconvenience of re-installing
all your applications and re-configuring your system settings should your computer
have a critical failure. If that machine just happened to be one used for development
as well, manually trying to get all your dependencies back to how they are supposed
to be can be a huge pain. These tools solve this issue.


Since I'd created a Vagrant setup for developing this website, I figured going
over the basics of it would be a good article to start with.

You'll need to install the necessary software to get started: Vagrant and a
virtualization provider. Vagrant comes with out-of-the-box support for
<a href="https://www.virtualbox.org/" target="_blank">VirtualBox</a> so I'll be
talking about that, although you're free to experiment with
<a href="http://docs.vagrantup.com/v2/providers/index.html" target="_blank">other providers</a>
as well.

VirtualBox 4.2.* and Vagrant 1.2.* are the latest versions at the time of writing
and can be downloaded at the following links:

<ul>
    <li><a href="https://www.virtualbox.org/wiki/Downloads" target="_blank">https://www.virtualbox.org/wiki/Downloads</a></li>
    <li><a href="http://downloads.vagrantup.com/" target="_blank">http://downloads.vagrantup.com/</a></li>
</ul>

## Creating a Vagrant Project

The first step is to create an empty directory and then initialize it with Vagrant.

    mkdir vagrant_vm && cd vagrant_vm
    vagrant init

A `Vagrantfile` will be generated inside the directory you just created. This contains
the configuration Vagrant will use to determine how to set up your virtual
machine. You'll see long blocks of text upon opening the file and this may be somewhat
intimidating. However, but most of it are commented explanations examples.
For reference, the file uses Ruby syntax but experience with the language shouldn't
be needed.

I'll only be covering how to do a basic setup but those inclined to look
further can check out the
<a href="http://docs.vagrantup.com/v2/" target="_blank">official documentation</a>.

## Configuring Vagrantfile

All the configuration in `Vagrantfile` is set up within a Ruby block between the
`Vagrant.configure("2") do |config|` near the top the `end` at the bottom. The
most important line you need to change is `config.vm.box = "base"`.
This tells Vagrant which base box to load up before configuring the machine.
Base boxes are basically VMs that have been packaged for reuse. You
can create your own from a VirtualBox VM using the
<a href="http://docs.vagrantup.com/v2/cli/package.html" target="_blank">vagrant package</a>
command, but I will be using the Ubuntu 12.04 64-bit box provided by Vagrant.
There is a long list of
<a href="http://www.vagrantbox.es/" target="_blank">other available boxes</a> as well.

In order to make a base box available to Vagrant, you must first add it using the
`vagrant add` command. The syntax is `vagrant box add box_name box_url`, where
`box_name` can be anything you want and `box_url` is where the base box can be downloaded.
For example, you can use the following to download the Ubuntu box I mentioned earlier:

    vagrant box add precise64 http://files.vagrantup.com/precise64.box

After the download finishes, you can change the `config.vm.box = "base"`
line we saw earlier into `config.vm.box = "precise64"`.

Now you essentially have a bare bones Vagrant VM. Executing `vagrant up` should
start up the machine and you can SSH into it with `vagrant ssh`.

## Provisioning with Puppet

While you have a basic Vagrant VM now, it's not much use without some personal
configuration. This is where Puppet comes in. Further down in your Vagrantfile,
you will see a commented block of code similar to the following:

    # config.vm.provision :puppet do |puppet|
    #   puppet.manifests_path = "manifests"
    #   puppet.manifest_file  = "init.pp"
    # end

This tells Vagrant to configure the VM with Puppet using a file called
`init.pp` in the `manifests` folder. Note that all paths are relative to where 
your Vagrantfile is located.
<a href="http://docs.puppetlabs.com/puppet/3/reference/index.html" target="_blank">Puppet</a>
is quite an extensive product which you could easily tell by the length of its
documentation so you'll likely want to dig further into it outside of this article.

First, you'll want to uncomment the block shown above. Then, add `puppet.module_path = "modules"`
somewhere in that block to end up with the following:

    config.vm.provision :puppet do |puppet|
        puppet.manifests_path = "manifests"
        puppet.manifest_file = "init.pp"

        puppet.module_path = "modules"
    end

While you can technically put all your Puppet configuration in `manifests/init.pp`,
this goes against Puppet best practices where all custom code should be defined
in modules.

We'll need to create several files and directories now as demonstrated by the below
commands. I will be creating a module called `git` for this article.

    mkdir manifests
    touch manifests/init.pp

    mkdir modules
    modules/git
    modules/git/manifests
    touch modules/git/manifests/init.pp

I won't go into detail why these steps are needed, but know this is the most basic
configuration required for a Puppet module to work. However,
do check out the <a href="http://docs.puppetlabs.com/puppet/3/reference/modules_fundamentals.html#module-layout" target="_blank">documentation</a> for a full description of how modules are laid out.

In the end, you should have a directory tree like the this:

    |-- Vagrantfile
    |-- manifests
        |-- init.pp
    |-- modules
        |-- git
            |-- manifests
                |-- init.pp

Open up your `modules/git/manifests/init.pp` for editing. This file must contain
the module's main class definition with the class name exactly equalling the module
name. For our class, it would need this at minimum:

    class git {
        # do something here
    }

Since our module is called `git`, let's install git by updating the file:

    class git {
        package { 'git':
            ensure => present
        }
    }

You'll want to look at the reference manual for Puppet syntax, but the above will
tell Puppet to ensure the `git` package is installed on your system.
Puppet is smart enough to know which package manager to use for the operating system
(apt in our case), but you could do the following to be safe:

    class git {
        package { 'git':
            ensure => present,
            provider => apt
        }
    }

You may also want to update your sources list before trying to install git:

    class git {
        exec { 'apt-update':
            command => '/usr/bin/apt-get update'
        }

        package { 'git':
            ensure => present,
            provider => apt,
            require => Exec['apt-update']
        }
    }

The file looks ok at this point, but you still need to tell Puppet to use this
module. In `modules/init.pp`, add the following:

    node default {
        include git
    }

Now you're done. In the directory where your `Vagrantfile` is located, run
`vagrant reload` which will shutdown your VM, restart it, and apply all
the configurations. Note that `vagrant provision` can normally apply configurations
to a VM while it is current running, but since the `manifests` and `modules` directory
did not exist when you first ran `vagrant up`, you need to reload the VM in order
for the new directories to get mounted.

First start after a configuration update might take a while, but your output
should look something like this in the end:

    [default] Attempting graceful shutdown of VM...
    [default] Setting the name of the VM...
    [default] Clearing any previously set forwarded ports...
    [default] Creating shared folders metadata...
    [default] Clearing any previously set network interfaces...
    [default] Preparing network interfaces based on configuration...
    [default] Forwarding ports...
    [default] -- 22 => 2222 (adapter 1)
    [default] Booting VM...
    [default] Waiting for VM to boot. This can take a few minutes.
    [default] VM booted and ready for use!
    [default] Mounting shared folders...
    [default] -- /vagrant
    [default] -- /tmp/vagrant-puppet/manifests
    [default] -- /tmp/vagrant-puppet/modules-0
    [default] Running provisioner: puppet...
    Running Puppet with init.pp...
    stdin: is not a tty
    notice: /Stage[main]/Git/Exec[apt-update]/returns: executed successfully
    notice: /Stage[main]/Git/Package[git]/ensure: created
    notice: Finished catalog run in 364.25 seconds

If you SSH into your VM again, the `git` command should now be available.

What's nice is that if you ever decide you want to use your Puppet scripts
without Vagrant, for example on a local machine, you can do so:

    puppet apply --modulepath modules manifests/init.pp

You'll need to have Puppet installed where you run this.

## Final Words

I hope this article gave an understandable introduction to these powerful
system management tools, and those interested should definitely study the
reference manuals at
<a href="http://docs.vagrantup.com/v2/" target="_blank">http://docs.vagrantup.com/v2/</a>
and <a href="http://docs.puppetlabs.com/puppet/3/reference/" target="_blank">http://docs.puppetlabs.com/puppet/3/reference/</a> to learn more.

My Jekyll VM is available on GitHub at
<a href="https://github.com/hhlu/vagrant-jekyll" target="_blank">https://github.com/hhlu/vagrant-jekyll</a> as well for a more complex example. Feel free to leave a comment for any additional
explanations or if anything was unclear.
